import { Plugin } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import AudioUtils from './audioutils';
import { isObject } from 'lodash-es';

export default class AudioToolbar extends Plugin {
    static get requires() {
        return [ WidgetToolbarRepository, AudioUtils ];
    }

    static get pluginName() {
        return 'AudioToolbar';
    }

    afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
        const audioUtils = editor.plugins.get( 'AudioUtils' );

        widgetToolbarRepository.register( 'audio', {
            ariaLabel: t( 'Audio toolbar' ),
            items: normalizeDeclarativeConfig( editor.config.get( 'audio.toolbar' ) || [] ),
            getRelatedElement: selection => audioUtils.getClosestSelectedAudioWidget( selection )
        } );
    }
}

function normalizeDeclarativeConfig( config ) {
    return config.map( item => isObject( item ) ? item.name : item );
}