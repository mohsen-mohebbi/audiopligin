var advancedsource = '';
if (document.getElementById('advancedsource') !== null) {
	if (
		document.getElementById('advancedsource').value !== null &&
		document.getElementById('advancedsource').value !== undefined &&
		document.getElementById('advancedsource').value !== ''
	) {
		advancedsource = document.getElementById('advancedsource').value;
	}
}

export function createIframeViewElement(writer, audioType) {
	console.log(writer);
	console.log(audioType);
	var iframeUrl = document
		.getElementsByTagName('iframe')[0]
		.getAttribute('src');
	const emptyElement = writer.createEmptyElement('iframe', {
		src: iframeUrl,
		mozallowfullscreen: 'true',
		webkitallowfullscreen: 'true',
		allowfullscreen: 'true',
	});
	const container = writer.createContainerElement('figure', {
		class: 'audio iframe',
	});
	writer.insert(writer.createPositionAt(container, 0), emptyElement);

	return container;
}

export function getAudioViewElementMatcher(editor, matchAudioType) {
	if (
		editor.plugins.has('AudioInlineEditing') !==
		editor.plugins.has('AudioBlockEditing')
	) {
		return {
			name: 'audio',
			attributes: {
				src: true,
				class:true
			},
		};
	}

	const audioUtils = editor.plugins.get('AudioUtils');

	return (element) => {
		if (
			!audioUtils.isInlineAudioView(element) ||
			!element.hasAttribute('src')
		) {
			return null;
		}
		const audioType = element.findAncestor(audioUtils.isBlockAudioView)
			? 'audioBlock'
			: 'audioInline';

		if (audioType !== matchAudioType) {
			return null;
		}

		return { name: true, attributes: ['src','class'] };
	};
}

import { first } from 'ckeditor5/src/utils';

export function createAudioViewElement(writer, audioType) {
	const audioElement = writer.createContainerElement('audio');

	// Add source element to the audio element
	const sourceElement = writer.createAttributeElement('source'); // Adjust the type based on your audio format
	writer.insert(writer.createPositionAt(audioElement, 0), sourceElement);

	const container =
		audioType === 'audioBlock'
			? writer.createContainerElement('figure', { class: 'audio' })
			: writer.createContainerElement(
					'span',
					{ class: 'audio-inline' },
					{ isAllowedInsideAttributeElement: true }
			  );

	writer.insert(writer.createPositionAt(container, 0), audioElement);

	return container;
}

export function determineAudioTypeForInsertionAtSelection(schema, selection) {
	const firstBlock = first(selection.getSelectedBlocks());

	if (!firstBlock || schema.isObject(firstBlock)) {
		return 'audioBlock';
	}

	if (firstBlock.isEmpty && firstBlock.name !== 'listItem') {
		return 'audioBlock';
	}

	return 'audioInline';
}