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

// import { first } from 'ckeditor5/src/utils';

// export function createVideoViewElement(writer, videoType) {
// 	var advancedPoster = "";
// 	if (document.getElementById('advancedPoster') !== null) {
// 		if (document.getElementById('advancedPoster').value !== null && document.getElementById('advancedPoster').value !== undefined && document.getElementById('advancedPoster').value !== '') {
// 			advancedPoster = document.getElementById('advancedPoster').value;
// 		}
// 	}

// 	var advancedsource = "";
// 	if (document.getElementById('advancedsource') !== null) {
// 		if (document.getElementById('advancedsource').value !== null && document.getElementById('advancedsource').value !== undefined && document.getElementById('advancedsource').value !== '') {
// 			advancedsource = document.getElementById('advancedsource').value;
// 		}
// 	}

// 	if (localStorage.getItem("videoupload") === "false") {
// 		if (advancedPoster === '' || advancedPoster === undefined || advancedPoster === null) {
// 			const emptyElement = writer.createContainerElement('video', { controls: 'controls', poster: '' });
// 			const source = writer.createEmptyElement('source', { src: advancedsource }, { isAllowedInsideAttributeElement: true });
// 			const container = writer.createContainerElement('figure', { class: 'video' });
// 			writer.insert(writer.createPositionAt(emptyElement, 0), source);
// 			writer.insert(writer.createPositionAt(container, 0), emptyElement);

// 			return container;
// 		}

// 		else {
// 			const emptyElement = writer.createContainerElement('video', { controls: 'controls', poster: advancedPoster });
// 			const source = writer.createEmptyElement('source', { src: advancedsource }, { isAllowedInsideAttributeElement: true });
// 			const container = writer.createContainerElement('figure', { class: 'video' })
// 			writer.insert(writer.createPositionAt(emptyElement, 0), source);
// 			writer.insert(writer.createPositionAt(container, 0), emptyElement);

// 			return container;
// 		}
// 	}

// 	else {
// 		// const emptyElement = writer.createEmptyElement('video', { controls: 'controls' }, { poster: advancedPoster });
// 		// const container = writer.createContainerElement('figure', { class: 'video' });
// 		// writer.insert(writer.createPositionAt(container, 0), emptyElement);

// 		// return container;

// 		const emptyElement = writer.createContainerElement('video', { controls: 'controls', poster: advancedPoster });
// 		const source = writer.createEmptyElement('source', { src: advancedsource }, { isAllowedInsideAttributeElement: true });
// 		const container = writer.createContainerElement('figure', { class: 'video' })
// 		writer.insert(writer.createPositionAt(emptyElement, 0), source);
// 		writer.insert(writer.createPositionAt(container, 0), emptyElement);

// 		return container;
// 	}
// }

export function createIframeViewElement(writer, videoType) {
	console.log(writer);
	console.log(videoType);
	var iframeUrl = document
		.getElementsByTagName('iframe')[0]
		.getAttribute('src');
	const emptyElement = writer.createEmptyElement('iframe', {
		src: iframeUrl,
		poster: '',
		mozallowfullscreen: 'true',
		webkitallowfullscreen: 'true',
		allowfullscreen: 'true',
	});
	const container = writer.createContainerElement('figure', {
		class: 'video iframe',
	});
	writer.insert(writer.createPositionAt(container, 0), emptyElement);

	return container;
}

export function getVideoViewElementMatcher(editor, matchVideoType) {
	if (
		editor.plugins.has('VideoInlineEditing') !==
		editor.plugins.has('VideoBlockEditing')
	) {
		return {
			name: 'video',
			attributes: {
				src: true,
				class:true
			},
		};
	}

	const videoUtils = editor.plugins.get('VideoUtils');

	return (element) => {
		if (
			!videoUtils.isInlineVideoView(element) ||
			!element.hasAttribute('src')
		) {
			return null;
		}
		const videoType = element.findAncestor(videoUtils.isBlockVideoView)
			? 'videoBlock'
			: 'videoInline';

		if (videoType !== matchVideoType) {
			return null;
		}

		return { name: true, attributes: ['src','class'] };
	};
}

// export function determineVideoTypeForInsertionAtSelection(schema, selection) {
// 	const firstBlock = first(selection.getSelectedBlocks());

// 	if (!firstBlock || schema.isObject(firstBlock)) {
// 		return 'videoBlock';
// 	}

// 	if (firstBlock.isEmpty && firstBlock.name !== 'listItem') {
// 		return 'videoBlock';
// 	}

// 	return 'videoInline';
// }

import { first } from 'ckeditor5/src/utils';

// export function createVideoViewElement(writer, videoType) {
// 	console.log('createVideoViewElement');
// 	const emptyElement = writer.createEmptyElement('video'); // اضافه کردن poster به ویدیو

// 	// const container =
// 	// 	videoType === 'videoBlock'
// 	// 		? writer.createContainerElement('figure', { class: 'video' })
// 	// 		: writer.createContainerElement(
// 	// 				'span',
// 	// 				{ class: 'video-inline' },
// 	// 				{ isAllowedInsideAttributeElement: true }
// 	// 		  );

// 	const container =
// 	writer.createContainerElement('figure', { class: 'video' }, { isAllowedInsideAttributeElement: true });

// 	writer.insert(writer.createPositionAt(container, 0), emptyElement);

// 	return container;
// }

export function createVideoViewElement(writer, videoType) {
	const videoElement = writer.createContainerElement('video');

	// Add source element to the video element
	const sourceElement = writer.createAttributeElement('source'); // Adjust the type based on your video format
	writer.insert(writer.createPositionAt(videoElement, 0), sourceElement);

	const container =
		videoType === 'videoBlock'
			? writer.createContainerElement('figure', { class: 'video' })
			: writer.createContainerElement(
					'span',
					{ class: 'video-inline' },
					{ isAllowedInsideAttributeElement: true }
			  );

	writer.insert(writer.createPositionAt(container, 0), videoElement);

	return container;
}

export function determineVideoTypeForInsertionAtSelection(schema, selection) {
	const firstBlock = first(selection.getSelectedBlocks());

	if (!firstBlock || schema.isObject(firstBlock)) {
		return 'videoBlock';
	}

	if (firstBlock.isEmpty && firstBlock.name !== 'listItem') {
		return 'videoBlock';
	}

	return 'videoInline';
}
