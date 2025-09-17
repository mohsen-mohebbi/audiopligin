import { FileRepository } from 'ckeditor5/src/upload';
import { Command } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

export default class UploadAudioCommand extends Command {
    refresh() {
        const editor = this.editor;
        const audioUtils = editor.plugins.get( 'AudioUtils' );
        const selectedElement = editor.model.document.selection.getSelectedElement();

        this.isEnabled = audioUtils.isAudioAllowed() || audioUtils.isAudio( selectedElement );
    }

    execute( options ) {
        if (!options.file && !options.files) {
            return;
        }

        const files = options.file ? toArray( options.file ) : toArray( options.files );
        const selection = this.editor.model.document.selection;
        const audioUtils = this.editor.plugins.get( 'AudioUtils' );
        const selectionAttributes = Object.fromEntries( selection.getAttributes() );

        files.forEach( ( file, index ) => {
            const selectedElement = selection.getSelectedElement();

            if ( index && selectedElement && audioUtils.isAudio( selectedElement ) ) {
                const position = this.editor.model.createPositionAfter( selectedElement );

                this._uploadAudio( file, selectionAttributes, position );
            } else {
                this._uploadAudio( file, selectionAttributes );
            }
        } );
    }

    _uploadAudio( file, attributes, position ) {
        const editor = this.editor;
        const fileRepository = editor.plugins.get( FileRepository );
        const loader = fileRepository.createLoader( file );
        const audioUtils = editor.plugins.get( 'AudioUtils' );

        if ( !loader ) {
            return;
        }

        audioUtils.insertAudio( { ...attributes, uploadId: loader.id }, position );
    }
}