import { Plugin } from 'ckeditor5/src/core';
import { WidgetResize } from 'ckeditor5/src/widget';
import AudioLoadObserver from '../audio/audioloadobserver';

const RESIZABLE_AUDIOS_CSS_SELECTOR =
	'figure.audio.ck-widget > audio,' +
	'figure.audio.ck-widget > a > audio,' +
	'span.audio-inline.ck-widget > audio';

const AUDIO_WIDGETS_CLASSES_MATCH_REGEXP = /(audio|audio-inline)/;

const RESIZED_AUDIO_CLASS = 'audio_resized';

export default class AudioResizeHandles extends Plugin {
	static get requires() {
		return [ WidgetResize ];
	}

	static get pluginName() {
		return 'AudioResizeHandles';
	}

	init() {
		const command = this.editor.commands.get('resizeAudio');
		this.bind('isEnabled').to(command);

		this._setupResizerCreator();
	}

	_setupResizerCreator() {

		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( AudioLoadObserver );
		this.listenTo( editingView.document, 'audioLoaded', ( evt, domEvent ) => {
			if ( !domEvent.target.matches( RESIZABLE_AUDIOS_CSS_SELECTOR) ) {
				return;
			}

			const domConverter = editor.editing.view.domConverter;
			const audioView = domConverter.domToView( domEvent.target );
			const widgetView = audioView.findAncestor( { classes: AUDIO_WIDGETS_CLASSES_MATCH_REGEXP } );
			let resizer = this.editor.plugins.get( WidgetResize ).getResizerByViewElement( widgetView );

			if ( resizer ) {
				resizer.redraw();

				return;
			}


			const mapper = editor.editing.mapper;
			const audioModel = mapper.toModelElement( widgetView );

			resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'audio.resizeUnit' ),

					modelElement: audioModel,
					viewElement: widgetView,
					editor,
					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'audio' );
					},
					getResizeHost( domWidgetElement ) {
						return domConverter.viewToDom( mapper.toViewElement( audioModel.parent ) );
					},
					isCentered() {
						const audioStyle = audioModel.getAttribute( 'audioStyle' );

						return !audioStyle || audioStyle === 'block' || audioStyle === 'alignCenter';
					},

					onCommit( newValue ) {
						editingView.change( writer => {
							writer.removeClass( RESIZED_AUDIO_CLASS, widgetView );
						} );

						editor.execute( 'resizeAudio', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widgetView.hasClass( RESIZED_AUDIO_CLASS ) ) {
					editingView.change( writer => {
						writer.addClass( RESIZED_AUDIO_CLASS, widgetView );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		} );
	}
}