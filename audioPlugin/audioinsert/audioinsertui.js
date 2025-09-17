import { Plugin } from 'ckeditor5/src/core';
import AudioInsertPanelView from './ui/audioinsertpanelview';
import { prepareIntegrations } from './utils';
import UpdateIframeEmbedCommand from '../../ckeditor5-iframe/src/updateiframeembedcommand';
import InsertIframeEmbedCommand from '../../ckeditor5-iframe/src/insertiframeembedcommand';
var advancedsource;
var iframesource;

export default class AudioInsertUI extends Plugin {
	static get pluginName() {
		return 'AudioInsertUI';
	}

	init() {
		const editor = this.editor;
		const componentCreator = (locale) => {
			return this._createDropdownView(locale);
		};

		editor.commands.add(
			'updateIframeEmbed',
			new UpdateIframeEmbedCommand(editor)
		);
		editor.commands.add(
			'insertIframeEmbed',
			new InsertIframeEmbedCommand(editor)
		);

		editor.ui.componentFactory.add('insertAudio', componentCreator);
		editor.ui.componentFactory.add('audioInsert', componentCreator);
	}

	_createDropdownView(locale) {
		const editor = this.editor;
		const audioInsertView = new AudioInsertPanelView(
			locale,
			prepareIntegrations(editor)
		);
		const command = editor.commands.get('uploadAudio');

		const dropdownView = audioInsertView.dropdownView;
		const splitButtonView = dropdownView.buttonView;

		splitButtonView.actionView =
			editor.ui.componentFactory.create('uploadAudio');
		splitButtonView.actionView.extendTemplate({
			attributes: {
				class: 'ck ck-button ck-splitbutton__action',
			},
		});

		return this._setUpDropdown(dropdownView, audioInsertView, command);
	}

	_setUpDropdown(dropdownView, audioInsertView, command) {
		const editor = this.editor;
		const t = editor.t;
		const insertButtonView = audioInsertView.insertButtonView;
		const insertAudioViaUrlForm =
			audioInsertView.getIntegration('insertAudioViaUrl');
		const panelView = dropdownView.panelView;
		const audioUtils = this.editor.plugins.get('AudioUtils');

		dropdownView.bind('isEnabled').to(command);

		dropdownView.buttonView.once('open', () => {
			panelView.children.add(audioInsertView);
		});

		dropdownView.on(
			'change:isOpen',
			() => {
				const selectedElement =
					editor.model.document.selection.getSelectedElement();

				if (dropdownView.isOpen) {
					audioInsertView.focus();

					if (audioUtils.isAudio(selectedElement)) {
						audioInsertView.audioURLInputValue =
							selectedElement.getAttribute('src');
						insertButtonView.label = t('Update');
						insertAudioViaUrlForm.label = t('Update audio URL');
					} else {
						audioInsertView.audioURLInputValue = '';
						insertButtonView.label = t('Insert');
						insertAudioViaUrlForm.label = t('آدرس اینترنتی صوت');
					}
				}
			},
			{ priority: 'low' }
		);

		audioInsertView
			.delegate('filemanager', 'submit', 'cancel')
			.to(dropdownView);
		this.delegate('cancel').to(dropdownView);

		dropdownView.on('filemanager', () => {
			closePanel();
			onSubmitFileOpen();
		});

		dropdownView.on('submit', () => {
			closePanel();
			onSubmit();
		});

		dropdownView.on('cancel', () => {
			closePanel();
		});

		function onSubmit() {
			const selectedElement =
				editor.model.document.selection.getSelectedElement();

			if (audioUtils.isAudio(selectedElement)) {
				editor.model.change((writer) => {
					writer.setAttribute(
						'src',
						audioInsertView.audioURLInputValue,
						selectedElement
					);
					writer.removeAttribute('sizes', selectedElement);
				});
			} else {
				editor.execute('insertAudio', {
					source: audioInsertView.audioURLInputValue,
				});
			}
		}

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		function onSubmitFileOpen() {
			document.getElementById('effectBody').classList.add('is-active');
			localStorage.setItem('audioupload', 'false');
			$('#internalMediaModal').modal('show');
			$('#internalMediaModal').css('display', 'block');
			var btn = document.getElementById('btninternalMedia');
			var mediatype = document.getElementById('mediaFormType');
			btn.onclick = function () {
				if (mediatype.value === 'general') {
					var main_url =
						document.getElementById('generalsource').value;
					var alternative_url =
						document.getElementById('advancedsource').value;
					if (
						main_url !== '' &&
						main_url !== undefined &&
						main_url !== null
					) {
						//#region main url
						if (
							alternative_url === '' ||
							alternative_url === undefined ||
							alternative_url === null
						) {
							editor.model.change((writer) => {
								const audioElement = writer.createElement(
									'audioBlock',
									{
										controls: '',
										src: main_url,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(audioElement, docFrag);
								editor.model.insertContent(
									docFrag,
									editor.model.document.selection
								);
							});
						}
						//#endregion

						//#region main and alternative url
						else if (
							alternative_url !== '' &&
							alternative_url !== undefined &&
							alternative_url !== null
						) {
							advancedsource =
								document.getElementById('advancedsource').value;
							editor.model.change((writer) => {
								const sourceElement = writer.createElement(
									'source',
									{
										src: alternative_url,
									}
								);
								const audioElement = writer.createElement(
									'audioBlock',
									{
										controls: '',
										src: main_url,
										source: alternative_url,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(sourceElement, audioElement);
								writer.append(audioElement, docFrag);
								editor.model.insertContent(
									docFrag,
									editor.model.document.selection
								);
							});
						}
						//#endregion

						$('#internalMediaModal').modal('hide');
						$('#internalMediaModal').css('display', 'none');
						$('body').removeClass('modal-open');
						document
							.getElementById('effectBody')
							.classList.remove('is-active');
					} else {
						alert('آدرس صوت نمیتواند خالی باشد!');
					}
				}

				if (mediatype.value === 'embeded') {
					var content = $('#embededmedia').val();
					var iframeUrl = $('<div>' + content + '</div>')
						.find('iframe[src^="http:"]')
						.prevObject[0].lastChild.lastChild.getAttribute('src');
					iframesource = iframeUrl;
					if (
						iframeUrl !== '' &&
						iframeUrl !== undefined &&
						iframeUrl !== null
					) {
						editor.execute('insertIframeEmbed');
						editor.editing.view.focus();

						const widgetWrapper =
							editor.editing.view.document.selection.getSelectedElement();

						widgetWrapper
							.getCustomProperty('iframeApi')
							.makeEditable();
						editor.execute('updateIframeEmbed', iframeUrl);
						editor.editing.view.focus();

						$('#internalMediaModal').modal('hide');
						$('#internalMediaModal').css('display', 'none');
						$('body').removeClass('modal-open');
						document
							.getElementById('effectBody')
							.classList.remove('is-active');
					} else {
						alert('آدرس کدآی فریم نمیتواند خالی باشد!');
					}
				}

				if (mediatype.value === 'advanced') {
					advancedsource =
						document.getElementById('advancedsource').value;
					editor.model.change((writer) => {
						const audioElement = writer.createElement(
							'audioBlock',
							{
								controls: '',
								src: advancedsource,
							}
						);
						const docFrag = writer.createDocumentFragment();
						writer.append(audioElement, docFrag);
						editor.model.insertContent(
							docFrag,
							editor.model.document.selection
						);
					});
					$('#internalMediaModal').modal('hide');
					$('#internalMediaModal').css('display', 'none');
					$('body').removeClass('modal-open');
					document
						.getElementById('effectBody')
						.classList.remove('is-active');
				}
			};
		}

		return dropdownView;
	}
}