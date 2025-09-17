import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
    objectFullWidth,
    objectInline,
    objectLeft,	objectRight, objectCenter,
    objectBlockLeft, objectBlockRight
} = icons;

const DEFAULT_OPTIONS = {
    inline: {
        name: 'inline',
        title: 'In line',
        icon: objectInline,
        modelElements: [ 'audioInline','audio' ],
        isDefault: true
    },

    alignLeft: {
        name: 'alignLeft',
        title: 'Left aligned audio',
        icon: objectLeft,
        modelElements: [ 'audioBlock', 'audioInline','audio' ],
        className: 'audio-style-align-left'
    },

    alignBlockLeft: {
        name: 'alignBlockLeft',
        title: 'Left aligned audio',
        icon: objectBlockLeft,
        modelElements: [ 'audioBlock','audio'  ],
        className: 'audio-style-block-align-left'
    },

    alignCenter: {
        name: 'alignCenter',
        title: 'Centered audio',
        icon: objectCenter,
        modelElements: [ 'audioBlock','audio'  ],
        className: 'audio-style-align-center'
    },

    alignRight: {
        name: 'alignRight',
        title: 'Right aligned audio',
        icon: objectRight,
        modelElements: [ 'audioBlock', 'audioInline','audio' ],
        className: 'audio-style-align-right'
    },

    alignBlockRight: {
        name: 'alignBlockRight',
        title: 'Right aligned audio',
        icon: objectBlockRight,
        modelElements: [ 'audioBlock','audio' ],
        className: 'audio-style-block-align-right'
    },

    block: {
        name: 'block',
        title: 'Centered audio',
        icon: objectCenter,
        modelElements: [ 'audioBlock','audio' ],
        isDefault: true
    },

    side: {
        name: 'side',
        title: 'Side audio',
        icon: objectRight,
        modelElements: [ 'audioBlock','audio'  ],
        className: 'audio-style-side'
    }
};

const DEFAULT_ICONS = {
    full: objectFullWidth,
    left: objectBlockLeft,
    right: objectBlockRight,
    center: objectCenter,
    inlineLeft: objectLeft,
    inlineRight: objectRight,
    inline: objectInline
};

const DEFAULT_DROPDOWN_DEFINITIONS = [ {
    name: 'audioStyle:wrapText',
    title: 'Wrap text',
    defaultItem: 'audioStyle:alignLeft',
    items: [ 'audioStyle:alignLeft', 'audioStyle:alignRight' ]
}, {
    name: 'audioStyle:breakText',
    title: 'Break text',
    defaultItem: 'audioStyle:block',
    items: [ 'audioStyle:alignBlockLeft', 'audioStyle:block', 'audioStyle:alignBlockRight' ]
} ];

function normalizeStyles( config ) {
    const configuredStyles = config.configuredStyles.options || [];

    const styles = configuredStyles
        .map( arrangement => normalizeDefinition( arrangement ) )
        .filter( arrangement => isValidOption( arrangement, config ) );

    return styles;
}

function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
    if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
        return {
            options: [
                'inline', 'alignLeft', 'alignRight',
                'alignCenter', 'alignBlockLeft', 'alignBlockRight',
                'block', 'side'
            ]
        };
    } else if ( isBlockPluginLoaded ) {
        return {
            options: [ 'block', 'side' ]
        };
    } else if ( isInlinePluginLoaded ) {
        return {
            options: [ 'inline', 'alignLeft', 'alignRight' ]
        };
    }

    return {};
}

function getDefaultDropdownDefinitions( pluginCollection ) {
    if ( pluginCollection.has( 'AudioBlockEditing' ) && pluginCollection.has( 'AudioInlineEditing' ) ) {
        return [ ...DEFAULT_DROPDOWN_DEFINITIONS ];
    } else {
        return [];
    }
}

function normalizeDefinition( definition ) {
    if ( typeof definition === 'string' ) {
        if ( !DEFAULT_OPTIONS[ definition ] ) {
            definition = { name: definition };
        }
        else {
            definition = { ...DEFAULT_OPTIONS[ definition ] };
        }
    } else {
        definition = extendStyle( DEFAULT_OPTIONS[ definition.name ], definition );
    }

    if ( typeof definition.icon === 'string' ) {
        definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
    }

    return definition;
}

function isValidOption( option, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
    const { modelElements, name } = option;

    if ( !modelElements || !modelElements.length || !name ) {
        warnInvalidStyle( { style: option } );

        return false;
    } else {
        const supportedElements = [ isBlockPluginLoaded ? 'audioBlock' : null, isInlinePluginLoaded ? 'audioInline' : null ];

        if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
            logWarning( 'audio-style-missing-dependency', {
                style: option,
                missingPlugins: modelElements.map( name => name === 'audioBlock' ? 'AudioBlockEditing' : 'AudioInlineEditing' )
            } );

            return false;
        }
    }

    return true;
}

function extendStyle( source, style ) {
    const extendedStyle = { ...style };

    for ( const prop in source ) {
        if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
            extendedStyle[ prop ] = source[ prop ];
        }
    }

    return extendedStyle;
}

function warnInvalidStyle( info ) {
    logWarning( 'audio-style-configuration-definition-invalid', info );
}

export default {
    normalizeStyles,
    getDefaultStylesConfiguration,
    getDefaultDropdownDefinitions,
    warnInvalidStyle,
    DEFAULT_OPTIONS,
    DEFAULT_ICONS,
    DEFAULT_DROPDOWN_DEFINITIONS
};