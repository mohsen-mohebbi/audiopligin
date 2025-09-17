import { Command } from 'ckeditor5/src/core';

export default class ResizeAudioCommand extends Command {
	refresh() {
		const editor = this.editor;
		const audioUtils = editor.plugins.get( 'AudioUtils' );
		const element = audioUtils.getClosestSelectedAudioElement( editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !element || !element.hasAttribute( 'width' ) ) {
			this.value = null;
		} else {
			this.value = {
				width: element.getAttribute( 'width' ),
				height: null
			};
		}
	}

	execute( options ) {
		const editor = this.editor;
		const model = editor.model;
		const audioUtils = editor.plugins.get( 'AudioUtils' );
		const audioElement = audioUtils.getClosestSelectedAudioElement(model.document.selection);

		this.value = {
			width: options.width,
			height: null
		};

		if ( audioElement ) {
			model.change( writer => {
				writer.setAttribute( 'width', options.width, audioElement );
			} );
		}
	}
}