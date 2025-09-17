import { BalloonPanelView } from 'ckeditor5/src/ui';

export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( editor.plugins.get( 'AudioUtils' ).getClosestSelectedAudioWidget( editor.editing.view.document.selection ) ) {
		const position = getBalloonPositionData( editor );

		balloon.updatePosition( position );
	}
}

export function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const audioUtils = editor.plugins.get( 'AudioUtils' );

	return {
		target: editingView.domConverter.viewToDom( audioUtils.getClosestSelectedAudioWidget( editingView.document.selection ) ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast
		]
	};
}