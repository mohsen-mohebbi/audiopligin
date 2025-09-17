import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter } from 'ckeditor5/src/engine';
import { Notification } from 'ckeditor5/src/ui';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { FileRepository } from 'ckeditor5/src/upload';
import { env } from 'ckeditor5/src/utils';
import AudioUtils from '../audioutils';
import UploadAudioCommand from './uploadaudiocommand';
import { fetchLocalAudio, isLocalAudio, createAudioTypeRegExp } from './utils';

const DEFAULT_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg'];

export default class AudioUploadEditing extends Plugin {
	static get requires() {
		return [FileRepository, Notification, ClipboardPipeline, AudioUtils];
	}

	static get pluginName() {
		return 'AudioUploadEditing';
	}

	constructor(editor) {
		super(editor);

		editor.config.define('audio.upload', {
			types: DEFAULT_AUDIO_EXTENSIONS,
			allowMultipleFiles: true,
		});

		this._uploadAudioElements = new Map();
	}

	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const conversion = editor.conversion;
		const fileRepository = editor.plugins.get(FileRepository);
		const audioUtils = editor.plugins.get('AudioUtils');
		const audioTypes = createAudioTypeRegExp(
			editor.config.get('audio.upload.types')
		);
		const uploadAudioCommand = new UploadAudioCommand(editor);

		editor.commands.add('uploadAudio', uploadAudioCommand);
		editor.commands.add('audioUpload', uploadAudioCommand);

		conversion.for('upcast').attributeToAttribute({
			view: {
				name: 'audio',
				key: 'uploadId',
			},
			model: 'uploadId',
		});

		this.listenTo(
			editor.editing.view.document,
			'clipboardInput',
			(evt, data) => {
				if (isHtmlIncluded(data.dataTransfer)) {
					return;
				}

				const audios = Array.from(data.dataTransfer.files).filter(
					(file) => {
						if (!file) {
							return false;
						}

						return audioTypes.test(file.type);
					}
				);

				if (!audios.length) {
					return;
				}

				evt.stop();

				editor.model.change((writer) => {
					if (data.targetRanges) {
						writer.setSelection(
							data.targetRanges.map((viewRange) =>
								editor.editing.mapper.toModelRange(viewRange)
							)
						);
					}

					editor.model.enqueueChange('default', () => {
						editor.execute('uploadAudio', { file: audios });
					});
				});
			}
		);

		this.listenTo(
			editor.plugins.get('ClipboardPipeline'),
			'inputTransformation',
			(evt, data) => {
				const fetchableAudios = Array.from(
					editor.editing.view.createRangeIn(data.content)
				)
					.filter(
						(value) =>
							isLocalAudio(audioUtils, value.item) &&
							!value.item.getAttribute('uploadProcessed')
					)
					.map((value) => {
						return {
							promise: fetchLocalAudio(value.item),
							audioElement: value.item,
						};
					});

				if (!fetchableAudios.length) {
					return;
				}

				const writer = new UpcastWriter(editor.editing.view.document);

				for (const fetchableAudio of fetchableAudios) {
					writer.setAttribute(
						'uploadProcessed',
						true,
						fetchableAudio.audioElement
					);

					const loader = fileRepository.createLoader(
						fetchableAudio.promise
					);

					if (loader) {
						writer.setAttribute(
							'src',
							'',
							fetchableAudio.audioElement
						);
						writer.setAttribute(
							'uploadId',
							loader.id,
							fetchableAudio.audioElement
						);
					}
				}
			}
		);

		editor.editing.view.document.on('dragover', (evt, data) => {
			data.preventDefault();
		});

		doc.on('change', () => {
			const changes = doc.differ
				.getChanges({ includeChangesInGraveyard: true })
				.reverse();
			const insertedAudiosIds = new Set();

			for (const entry of changes) {
				if (entry.type === 'insert' && entry.name !== '$text') {
					const item = entry.position.nodeAfter;
					const isInsertedInGraveyard =
						entry.position.root.rootName === '$graveyard';

					for (const audioElement of getAudiosFromChangeItem(
						editor,
						item
					)) {
						const uploadId = audioElement.getAttribute('uploadId');

						if (!uploadId) {
							continue;
						}

						const loader = fileRepository.loaders.get(uploadId);

						if (!loader) {
							continue;
						}

						if (isInsertedInGraveyard) {
							if (!insertedAudiosIds.has(uploadId)) {
								loader.abort();
							}
						} else {
							insertedAudiosIds.add(uploadId);
							this._uploadAudioElements.set(
								uploadId,
								audioElement
							);

							if (loader.status == 'idle') {
								this._readAndUpload(loader);
							}
						}
					}
				}
			}
		});

		this.on(
			'uploadComplete',
			(evt, { audioElement, data }) => {
				const urls = data.urls ? data.urls : data;
				this.editor.model.change((writer) => {
					writer.setAttribute('src', urls.default, audioElement);
                    writer.setAttributes( {
                        controls: true
                    }, audioElement );
				});
			},
			{ priority: 'low' }
		);
	}

	afterInit() {
		const schema = this.editor.model.schema;

		if (this.editor.plugins.has('AudioBlockEditing')) {
			schema.extend('audioBlock', {
				allowAttributes: ['uploadId', 'uploadStatus'],
			});
		}

		if (this.editor.plugins.has('AudioInlineEditing')) {
			schema.extend('audioInline', {
				allowAttributes: ['uploadId', 'uploadStatus'],
			});
		} else {
			schema.extend('audio', {
				allowAttributes: ['uploadId', 'uploadStatus'],
			});
		}
	}

	_readAndUpload(loader) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get(FileRepository);
		const notification = editor.plugins.get(Notification);
		const audioUtils = editor.plugins.get('AudioUtils');
		const audioUploadElements = this._uploadAudioElements;

		model.enqueueChange('transparent', (writer) => {
			writer.setAttribute(
				'uploadStatus',
				'reading',
				audioUploadElements.get(loader.id)
			);
		});

		return loader
			.read()
			.then(() => {
				const promise = loader.upload();
				const audioElement = audioUploadElements.get(loader.id);

				if (env.isSafari) {
					const viewFigure =
						editor.editing.mapper.toViewElement(audioElement);
					const viewAudio =
						audioUtils.findViewAudioElement(viewFigure);

					editor.editing.view.once('render', () => {
						if (!viewAudio.parent) {
							return;
						}

						const domFigure =
							editor.editing.view.domConverter.mapViewToDom(
								viewAudio.parent
							);

						if (!domFigure) {
							return;
						}

						const originalDisplay = domFigure.style.display;

						domFigure.style.display = 'none';

						domFigure._ckHack = domFigure.offsetHeight;

						domFigure.style.display = originalDisplay;
					});
				}

				model.enqueueChange('transparent', (writer) => {
					writer.setAttribute(
						'uploadStatus',
						'uploading',
						audioElement
					);
				});

				return promise;
			})
			.then((data) => {
				model.enqueueChange('transparent', (writer) => {
					const audioElement = audioUploadElements.get(loader.id);

					writer.setAttribute(
						'uploadStatus',
						'complete',
						audioElement
					);

					this.fire('uploadComplete', { data, audioElement });
				});

				clean();
			})
			.catch((error) => {
				if (loader.status !== 'error' && loader.status !== 'aborted') {
					throw error;
				}

				if (loader.status === 'error' && error) {
					notification.showWarning(error, {
						title: t('Upload failed'),
						namespace: 'upload',
					});
				}

				model.enqueueChange('transparent', (writer) => {
					writer.remove(audioUploadElements.get(loader.id));
				});

				clean();
			});

		function clean() {
			model.enqueueChange('transparent', (writer) => {
				const audioElement = audioUploadElements.get(loader.id);

				writer.removeAttribute('uploadId', audioElement);
				writer.removeAttribute('uploadStatus', audioElement);

				audioUploadElements.delete(loader.id);
			});

			fileRepository.destroyLoader(loader);
		}
	}
}

export function isHtmlIncluded(dataTransfer) {
	return (
		Array.from(dataTransfer.types).includes('text/html') &&
		dataTransfer.getData('text/html') !== ''
	);
}

function getAudiosFromChangeItem(editor, item) {
	const audioUtils = editor.plugins.get('AudioUtils');

	return Array.from(editor.model.createRangeOn(item))
		.filter((value) => audioUtils.isAudio(value.item))
		.map((value) => value.item);
}