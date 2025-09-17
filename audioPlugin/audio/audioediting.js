import { Plugin } from 'ckeditor5/src/core';
import AudioLoadObserver from './audioloadobserver';
import InsertAudioCommand from './insertaudiocommand';
import AudioUtils from '../audioutils';

export default class AudioEditing extends Plugin {
	static get requires() {
		return [AudioUtils];
	}

	static get pluginName() {
		return 'AudioEditing';
	}

	init() {
		const editor = this.editor;
		const conversion = editor.conversion;

		editor.editing.view.addObserver(AudioLoadObserver);

		conversion
			.for('upcast')
			
			.attributeToAttribute({
				view: {
					name: 'audio',
					key: 'controls',
				},
				model: 'controls'
			})

			.attributeToAttribute({
				view: {
					name: 'audio',
					key: 'source',
				},
				model: 'source'
			})


		const insertAudioCommand = new InsertAudioCommand(editor);
		editor.commands.add('insertAudio', insertAudioCommand);
		editor.commands.add('audioInsert', insertAudioCommand);
	}
}