import { global } from 'ckeditor5/src/utils';

export function createAudioTypeRegExp(types) {
    const regExpSafeNames = types.map(type => type.replace('+', '\\+'));
    return new RegExp(`^audio\\/(${regExpSafeNames.join('|')})$`);
}

export function fetchLocalAudio( audio ) {
    return new Promise( ( resolve, reject ) => {
        const audioSrc = audio.getAttribute( 'src' );

        // Fetch works asynchronously and so does not block browser UI when processing data.
        fetch( audioSrc )
            .then( resource => resource.blob() )
            .then( blob => {
                const mimeType = getAudioMimeType( blob, audioSrc );
                const ext = mimeType.replace( 'audio/', '' );
                const filename = `audio.${ ext }`;
                const file = new File( [ blob ], filename, { type: mimeType } );

                resolve( file );
            } )
            .catch( err => {
                return err && err.name === 'TypeError' ?
                    convertLocalAudioOnCanvas( audioSrc ).then( resolve ).catch( reject ) :
                    reject( err );
            } );
    } );
}

export function isLocalAudio( audioUtils, node ) {
    if ( !audioUtils.isInlineAudioView( node ) || !node.getAttribute( 'src' ) ) {
        return false;
    }

    return node.getAttribute( 'src' ).match( /^data:audio\/\w+;base64,/g ) ||
        node.getAttribute( 'src' ).match( /^blob:/g );
}

function getAudioMimeType( blob, src ) {
    if ( blob.type ) {
        return blob.type;
    } else if ( src.match( /data:(audio\/\w+);base64/ ) ) {
        return src.match( /data:(audio\/\w+);base64/ )[ 1 ].toLowerCase();
    } else {
        // Fallback to 'mp3' as common extension.
        return 'audio/mp3';
    }
}

function convertLocalAudioOnCanvas( audioSrc ) {
    return getBlobFromCanvas( audioSrc ).then( blob => {
        const mimeType = getAudioMimeType( blob, audioSrc );
        const ext = mimeType.replace( 'audio/', '' );
        const filename = `audio.${ ext }`;

        return new File( [ blob ], filename, { type: mimeType } );
    } );
}

function getBlobFromCanvas( audioSrc ) {
    return new Promise( ( resolve, reject ) => {
        const audio = global.document.createElement( 'audio' );

        audio.addEventListener( 'load', () => {
            const canvas = global.document.createElement( 'canvas' );

            canvas.width = audio.width;
            canvas.height = audio.height;

            const ctx = canvas.getContext( '2d' );

            ctx.drawAudio( audio, 0, 0 );

            canvas.toBlob( blob => blob ? resolve( blob ) : reject() );
        } );

        audio.addEventListener( 'error', () => reject() );

        audio.src = audioSrc;
    } );
}