import { Plugin } from 'ckeditor5/src/core';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { LivePosition, LiveRange } from 'ckeditor5/src/engine';
import { Undo } from 'ckeditor5/src/undo';
import { global } from 'ckeditor5/src/utils';
import AudioUtils from './audioutils';

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const AUDIO_URL_REGEXP = new RegExp( String( /^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source +
    /\.(mp3|wav|ogg|oga|aac|flac|m4a|wma|MP3|WAV|OGG|OGA|AAC|FLAC|M4A|WMA)/.source +
    /(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source +
    /(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source ) );

export default class AutoAudio extends Plugin {
    static get requires() {
        return [ Clipboard, AudioUtils, Undo ];
    }

    static get pluginName() {
        return 'AutoAudio';
    }

    constructor( editor ) {
        super( editor );

        this._timeoutId = null;
        this._positionToInsert = null;
    }

    init() {
        const editor = this.editor;
        const modelDocument = editor.model.document;

        this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', () => {
            const firstRange = modelDocument.selection.getFirstRange();

            const leftLivePosition = LivePosition.fromPosition( firstRange.start );
            leftLivePosition.stickiness = 'toPrevious';

            const rightLivePosition = LivePosition.fromPosition( firstRange.end );
            rightLivePosition.stickiness = 'toNext';

            modelDocument.once( 'change:data', () => {
                this._embedAudioBetweenPositions( leftLivePosition, rightLivePosition );

                leftLivePosition.detach();
                rightLivePosition.detach();
            }, { priority: 'high' } );
        } );

        editor.commands.get( 'undo' ).on( 'execute', () => {
            if ( this._timeoutId ) {
                global.window.clearTimeout( this._timeoutId );
                this._positionToInsert.detach();

                this._timeoutId = null;
                this._positionToInsert = null;
            }
        }, { priority: 'high' } );
    }

    _embedAudioBetweenPositions(leftPosition, rightPosition ) {
        const editor = this.editor;
        const urlRange = new LiveRange( leftPosition, rightPosition );
        const walker = urlRange.getWalker( { ignoreElementEnd: true } );
        const selectionAttributes = Object.fromEntries( editor.model.document.selection.getAttributes() );
        const audioUtils = this.editor.plugins.get( 'AudioUtils' );

        let src = '';

        for ( const node of walker ) {
            if ( node.item.is( '$textProxy' ) ) {
                src += node.item.data;
            }
        }

        src = src.trim();

        if ( !src.match( AUDIO_URL_REGEXP ) ) {
            urlRange.detach();

            return;
        }

        this._positionToInsert = LivePosition.fromPosition( leftPosition );

        this._timeoutId = global.window.setTimeout( () => {
            const audioCommand = editor.commands.get( 'insertAudio' );

            if ( !audioCommand.isEnabled ) {
                urlRange.detach();

                return;
            }

            editor.model.change( writer => {
                this._timeoutId = null;

                writer.remove( urlRange );
                urlRange.detach();

                let insertionPosition;

                if ( this._positionToInsert.root.rootName !== '$graveyard' ) {
                    insertionPosition = this._positionToInsert.toPosition();
                }

                audioUtils.insertAudio( { ...selectionAttributes, src }, insertionPosition )

                this._positionToInsert.detach();
                this._positionToInsert = null;
            } );
        }, 100 );
    }
}