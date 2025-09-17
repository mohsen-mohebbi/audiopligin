import { Plugin } from 'ckeditor5/src/core';
import VideoInsertPanelView from './ui/videoinsertpanelview';
import { prepareIntegrations } from './utils';
import UpdateIframeEmbedCommand from '../../ckeditor5-iframe/src/updateiframeembedcommand';
import InsertIframeEmbedCommand from '../../ckeditor5-iframe/src/insertiframeembedcommand';
var advancedPoster;
var advancedsource;
var iframesource;

export default class VideoInsertUI extends Plugin {
	static get pluginName() {
		return 'VideoInsertUI';
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

		editor.ui.componentFactory.add('insertVideo', componentCreator);
		editor.ui.componentFactory.add('videoInsert', componentCreator);
	}

	_createDropdownView(locale) {
		const editor = this.editor;
		const videoInsertView = new VideoInsertPanelView(
			locale,
			prepareIntegrations(editor)
		);
		const command = editor.commands.get('uploadVideo');

		const dropdownView = videoInsertView.dropdownView;
		const splitButtonView = dropdownView.buttonView;

		splitButtonView.actionView =
			editor.ui.componentFactory.create('uploadVideo');
		splitButtonView.actionView.extendTemplate({
			attributes: {
				class: 'ck ck-button ck-splitbutton__action',
			},
		});

		return this._setUpDropdown(dropdownView, videoInsertView, command);
	}

	_setUpDropdown(dropdownView, videoInsertView, command) {
		const editor = this.editor;
		const t = editor.t;
		const insertButtonView = videoInsertView.insertButtonView;
		const insertVideoViaUrlForm =
			videoInsertView.getIntegration('insertVideoViaUrl');
		const panelView = dropdownView.panelView;
		const videoUtils = this.editor.plugins.get('VideoUtils');

		dropdownView.bind('isEnabled').to(command);

		dropdownView.buttonView.once('open', () => {
			panelView.children.add(videoInsertView);
		});

		dropdownView.on(
			'change:isOpen',
			() => {
				const selectedElement =
					editor.model.document.selection.getSelectedElement();

				if (dropdownView.isOpen) {
					videoInsertView.focus();

					if (videoUtils.isVideo(selectedElement)) {
						videoInsertView.videoURLInputValue =
							selectedElement.getAttribute('src');
						insertButtonView.label = t('Update');
						insertVideoViaUrlForm.label = t('Update video URL');
					} else {
						videoInsertView.videoURLInputValue = '';
						insertButtonView.label = t('Insert');
						insertVideoViaUrlForm.label = t('آدرس اینترنتی ویدیو');
					}
				}
			},
			{ priority: 'low' }
		);

		videoInsertView
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

			if (videoUtils.isVideo(selectedElement)) {
				editor.model.change((writer) => {
					writer.setAttribute(
						'src',
						videoInsertView.videoURLInputValue,
						selectedElement
					);
					writer.removeAttribute('sizes', selectedElement);
				});
			} else {
				editor.execute('insertVideo', {
					source: videoInsertView.videoURLInputValue,
				});
			}
		}

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		function onSubmitFileOpen() {
			document.getElementById('effectBody').classList.add('is-active');
			localStorage.setItem('videoupload', 'false');
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
					var poster_url =
						document.getElementById('advancedPoster').value;
					if (
						main_url !== '' &&
						main_url !== undefined &&
						main_url !== null
					) {
						//#region main url
						if (
							(alternative_url === '' ||
								alternative_url === undefined ||
								alternative_url === null) &&
							(poster_url === '' ||
								poster_url === undefined ||
								poster_url === null)
						) {
							editor.model.change((writer) => {
								const videoElement = writer.createElement(
									'videoBlock',
									{
										controls: '',
										src: main_url,
										poster: null,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(videoElement, docFrag);
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
							alternative_url !== null &&
							(poster_url === '' ||
								poster_url === undefined ||
								poster_url === null)
						) {
							advancedPoster =
								document.getElementById('advancedPoster').value;
							advancedsource =
								document.getElementById('advancedsource').value;
							editor.model.change((writer) => {
								const sourceElement = writer.createElement(
									'source',
									{
										src: alternative_url,
									}
								);
								const videoElement = writer.createElement(
									'videoBlock',
									{
										controls: '',
										src: main_url,
										source: alternative_url,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(sourceElement, videoElement);
								writer.append(videoElement, docFrag);
								editor.model.insertContent(
									docFrag,
									editor.model.document.selection
								);
							});
						}
						//#endregion

						//#region main and poster url
						else if (
							(alternative_url === '' ||
								alternative_url === undefined ||
								alternative_url === null) &&
							poster_url !== '' &&
							poster_url !== undefined &&
							poster_url !== null
						) {
							editor.model.change((writer) => {
								const videoElement = writer.createElement(
									'videoBlock',
									{
										controls: '',
										src: main_url,
										poster: poster_url,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(videoElement, docFrag);
								editor.model.insertContent(
									docFrag,
									editor.model.document.selection
								);
							});
						}
						//#endregion

						//#region all url
						else if (
							alternative_url !== '' &&
							alternative_url !== undefined &&
							alternative_url !== null &&
							poster_url !== '' &&
							poster_url !== undefined &&
							poster_url !== null
						) {
							advancedPoster =
								document.getElementById('advancedPoster').value;
							advancedsource =
								document.getElementById('advancedsource').value;
							editor.model.change((writer) => {
								const sourceElement = writer.createElement(
									'source',
									{
										src: alternative_url,
									}
								);
								const videoElement = writer.createElement(
									'videoBlock',
									{
										controls: '',
										src: main_url,
										source: alternative_url,
										poster: poster_url,
									}
								);
								const docFrag = writer.createDocumentFragment();
								writer.append(sourceElement, videoElement);
								writer.append(videoElement, docFrag);
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
						alert('آدرس ویدیو نمیتواند خالی باشد!');
					}
				}

				if (mediatype.value === 'embeded') {
					// var iframeUrl = document.getElementsByTagName("iframe")[0].getAttribute('src');
					// var iframeUrl = document.getElementById('embededmedia').value;
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
						// editor.model.change(writer => {
						// 	const iframeElement = writer.createElement('iframe', { src: iframeUrl, poster: "" });
						// 	const docFrag = writer.createDocumentFragment();
						// 	writer.append(iframeElement, docFrag);
						// 	editor.model.insertContent(docFrag, editor.model.document.selection);
						// });
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
					advancedPoster =
						document.getElementById('advancedPoster').value;
					advancedsource =
						document.getElementById('advancedsource').value;
					editor.model.change((writer) => {
						const videoElement = writer.createElement(
							'videoBlock',
							{
								controls: '',
								src: advancedsource,
								poster: advancedPoster,
							}
						);
						const docFrag = writer.createDocumentFragment();
						writer.append(videoElement, docFrag);
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
