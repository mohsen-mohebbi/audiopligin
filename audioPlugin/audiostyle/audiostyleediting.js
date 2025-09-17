import { Plugin } from 'ckeditor5/src/core';
import AudioStyleCommand from './audiostylecommand';
import AudioUtils from '../audioutils';
import utils from './utils';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';

export default class AudioStyleEditing extends Plugin {
    static get pluginName() {
        return 'AudioStyleEditing';
    }

    static get requires() {
        return [ AudioUtils ];
    }

    init() {
        const { normalizeStyles, getDefaultStylesConfiguration } = utils;
        const editor = this.editor;
        const isBlockPluginLoaded = editor.plugins.has( 'AudioBlockEditing' );
        const isInlinePluginLoaded = editor.plugins.has( 'AudioInlineEditing' );

        editor.config.define( 'audio.styles', getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) );

        this.normalizedStyles = normalizeStyles( {
            configuredStyles: editor.config.get( 'audio.styles' ),
            isBlockPluginLoaded,
            isInlinePluginLoaded
        } );

        this._setupConversion( isBlockPluginLoaded, isInlinePluginLoaded );
        this._setupPostFixer();

        editor.commands.add( 'audioStyle', new AudioStyleCommand( editor, this.normalizedStyles ) );
    }

    _setupConversion( isBlockPluginLoaded, isInlinePluginLoaded ) {
        const editor = this.editor;
        const schema = editor.model.schema;

        const modelToViewConverter = modelToViewStyleAttribute( this.normalizedStyles );
        const viewToModelConverter = viewToModelStyleAttribute( this.normalizedStyles );

        editor.editing.downcastDispatcher.on( 'attribute:audioStyle', modelToViewConverter );
        editor.data.downcastDispatcher.on( 'attribute:audioStyle', modelToViewConverter );

        if ( isBlockPluginLoaded ) {
            schema.extend( 'audioBlock', { allowAttributes: 'audioStyle' } );
            editor.data.upcastDispatcher.on( 'element:figure', viewToModelConverter, { priority: 'low' } );
        }

        if ( isInlinePluginLoaded ) {
            schema.extend( 'audioInline', { allowAttributes: 'audioStyle' } );
            editor.data.upcastDispatcher.on( 'element:audio', viewToModelConverter, { priority: 'low' } );
        }
    }

    _setupPostFixer() {
        const editor = this.editor;
        const document = editor.model.document;

        const audioUtils = editor.plugins.get( 'AudioUtils' );
        const stylesMap = new Map( this.normalizedStyles.map( style => [ style.name, style ] ) );

        document.registerPostFixer( writer => {
            let changed = false;

            for ( const change of document.differ.getChanges() ) {
                if ( change.type === 'insert' || change.type === 'attribute' && change.attributeKey === 'audioStyle' ) {
                    let element = change.type === 'insert' ? change.position.nodeAfter : change.range.start.nodeAfter;

                    if ( element && element.is( 'element', 'paragraph' ) && element.childCount > 0 ) {
                        element = element.getChild( 0 );
                    }

                    if ( !audioUtils.isAudio( element ) ) {
                        continue;
                    }

                    const audioStyle = element.getAttribute( 'audioStyle' );

                    if ( !audioStyle ) {
                        continue;
                    }

                    const audioStyleDefinition = stylesMap.get( audioStyle );

                    if ( !audioStyleDefinition || !audioStyleDefinition.modelElements.includes( element.name ) ) {
                        writer.removeAttribute( 'audioStyle', element );
                        changed = true;
                    }
                }
            }

            return changed;
        } );
    }
}