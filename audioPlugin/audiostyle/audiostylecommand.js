import { Command } from 'ckeditor5/src/core';

export default class AudioStyleCommand extends Command {
    constructor( editor, styles ) {
        super( editor );

        this._defaultStyles = {
            audioBlock: false,
            audioInline: false
        };

        this._styles = new Map( styles.map( style => {
            if ( style.isDefault ) {
                for ( const modelElementName of style.modelElements ) {
                    this._defaultStyles[ modelElementName ] = style.name;
                }
            }

            return [ style.name, style ];
        } ) );
    }

    refresh() {
        const editor = this.editor;
        const audioUtils = editor.plugins.get( 'AudioUtils' );
        const element = audioUtils.getClosestSelectedAudioElement( this.editor.model.document.selection );

        this.isEnabled = !!element;

        if ( !this.isEnabled ) {
            this.value = false;
        } else if ( element.hasAttribute( 'audioStyle' ) ) {
            this.value = element.getAttribute( 'audioStyle' );
        } else {
            this.value = this._defaultStyles[ element.name ];
        }
    }

    execute( options = {} ) {
        const editor = this.editor;
        const model = editor.model;
        const audioUtils = editor.plugins.get( 'AudioUtils' );

        model.change( writer => {
            const requestedStyle = options.value;

            let audioElement = audioUtils.getClosestSelectedAudioElement( model.document.selection );

            if ( requestedStyle && this.shouldConvertAudioType( requestedStyle, audioElement ) ) {
                this.editor.execute( audioUtils.isBlockAudio( audioElement ) ? 'audioTypeInline' : 'audioTypeBlock' );
                audioElement = audioUtils.getClosestSelectedAudioElement( model.document.selection );
            }

            if ( !requestedStyle || this._styles.get( requestedStyle ).isDefault ) {
                writer.removeAttribute( 'audioStyle', audioElement );
            } else {
                writer.setAttribute( 'audioStyle', requestedStyle, audioElement );
            }
        } );
    }

    shouldConvertAudioType( requestedStyle, audioElement ) {
        const supportedTypes = this._styles.get( requestedStyle ).modelElements;

        return !supportedTypes.includes( audioElement.name );
    }
}