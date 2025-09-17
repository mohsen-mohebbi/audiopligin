import { Plugin } from 'ckeditor5/src/core';
import AudioUtils from "../audioutils";
import ResizeAudioCommand from './resizeaudiocommand';

export default class AudioResizeEditing extends Plugin {
	static get requires() {
		return [AudioUtils];
	}

	static get pluginName() {
		return 'AudioResizeEditing';
	}

	constructor(editor) {
		super(editor);

		editor.config.define('audio', {
			resizeUnit: 'px',
			resizeOptions: [{
				name: 'resizeAudio:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'resizeAudio:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'resizeAudio:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'resizeAudio:75',
				value: '75',
				icon: 'large'
			}]
		});
	}

	init() {
		const editor = this.editor;
		const resizeAudioCommand = new ResizeAudioCommand(editor);

		this._registerSchema();
		this._registerConverters('audioBlock');
		this._registerConverters('audioInline');
		this._registerConverters('audio');

		editor.commands.add('resizeAudio', resizeAudioCommand);
		editor.commands.add('audioResize', resizeAudioCommand);
	}

	_registerSchema() {
		if (this.editor.plugins.has('AudioBlockEditing')) {
			this.editor.model.schema.extend('audioBlock', { allowAttributes: 'width' });
		}

		if (this.editor.plugins.has('AudioInlineEditing')) {
			this.editor.model.schema.extend('audioInline', { allowAttributes: 'width' });
		}

		else {
			this.editor.model.schema.extend('audio', { allowAttributes: 'width' });
		}
	}

	_registerConverters(audioType) {
		const editor = this.editor;

		editor.conversion.for('downcast').add(dispatcher =>
			dispatcher.on(`attribute:width:${audioType}`, (evt, data, conversionApi) => {
				if (!conversionApi.consumable.consume(data.item, evt.name)) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement(data.item);
				const resizeUnit = this.editor.config.get('audio.resizeUnit') || '%';

				
				function removeExtraPx(value) {
					return value.replace('pxpx', 'px');
				}


				if (data.attributeNewValue !== null) {
					let newValue = removeExtraPx(data.attributeNewValue + resizeUnit)
					viewWriter.setStyle('width', newValue, figure);
					viewWriter.addClass('audio_resized', figure);
				} else {
					viewWriter.removeStyle('width', figure);
					viewWriter.removeClass('audio_resized', figure);
				}
			})
		);

		editor.conversion.for('upcast')
			.attributeToAttribute({
				view: {
					name: audioType === 'audioBlock' ? 'figure' : 'audio',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'width',
					value: viewElement => viewElement.getStyle('width')
				}
			});
	}
}