import { LabeledFieldView, createLabeledInputText } from 'ckeditor5/src/ui';

export function prepareIntegrations( editor ) {
    const panelItems = editor.config.get( 'audio.insert.integrations' );
    const audioInsertUIPlugin = editor.plugins.get( 'AudioInsertUI' );

    const PREDEFINED_INTEGRATIONS = {
        'insertAudioViaUrl': createLabeledInputView( editor.locale )
    };

    if ( !panelItems ) {
        return PREDEFINED_INTEGRATIONS;
    }

    // Prepares ckfinder component for the `openCKFinder` integration token.
    if ( panelItems.find( item => item === 'openCKFinder' ) && editor.ui.componentFactory.has( 'ckfinder' ) ) {
        const ckFinderButton = editor.ui.componentFactory.create( 'ckfinder' );
        ckFinderButton.set( {
            withText: true,
            class: 'ck-audio-insert__ck-finder-button'
        } );

        // We want to close the dropdown panel view when user clicks the ckFinderButton.
        ckFinderButton.delegate( 'execute' ).to( audioInsertUIPlugin, 'cancel' );

        PREDEFINED_INTEGRATIONS.openCKFinder = ckFinderButton;
    }

    return panelItems.reduce( ( object, key ) => {
        if ( PREDEFINED_INTEGRATIONS[ key ] ) {
            object[ key ] = PREDEFINED_INTEGRATIONS[ key ];
        } else if ( editor.ui.componentFactory.has( key ) ) {
            object[ key ] = editor.ui.componentFactory.create( key );
        }

        return object;
    }, {} );
}

export function createLabeledInputView( locale ) {
    const t = locale.t;
    const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );

    labeledInputView.set( {
        label: t( 'Insert audio via URL' )
    } );
    labeledInputView.fieldView.placeholder = 'https://example.com/audio.mp3';

    return labeledInputView;
}