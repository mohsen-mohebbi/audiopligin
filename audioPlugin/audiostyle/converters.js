import { first } from 'ckeditor5/src/utils';

export function modelToViewStyleAttribute( styles ) {
    return ( evt, data, conversionApi ) => {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
            return;
        }

        const newStyle = getStyleDefinitionByName( data.attributeNewValue, styles );
        const oldStyle = getStyleDefinitionByName( data.attributeOldValue, styles );

        const viewElement = conversionApi.mapper.toViewElement( data.item );
        const viewWriter = conversionApi.writer;

        if ( oldStyle ) {
            viewWriter.removeClass( oldStyle.className, viewElement );
        }

        if ( newStyle ) {
            viewWriter.addClass( newStyle.className, viewElement );
        }
    };
}

export function viewToModelStyleAttribute( styles ) {
    const nonDefaultStyles = {
        audioInline: styles.filter( style => !style.isDefault && style.modelElements.includes( 'audioInline' ) ),
        audioBlock: styles.filter( style => !style.isDefault && style.modelElements.includes( 'audioBlock' ) )
    };

    return ( evt, data, conversionApi ) => {
        if ( !data.modelRange ) {
            return;
        }

        const viewElement = data.viewItem;
        const modelAudioElement = first( data.modelRange.getItems() );

        if ( !modelAudioElement ) {
            return;
        }

        // for ( const style of nonDefaultStyles[ modelAudioElement.name ] ) {
        //     if ( conversionApi.consumable.consume( viewElement, { classes: style.className } ) ) {
        //         conversionApi.writer.setAttribute( 'audioStyle', style.name, modelAudioElement );
        //     }
        // }
    };
}

function getStyleDefinitionByName( name, styles ) {
    for ( const style of styles ) {
        if ( style.name === name ) {
            return style;
        }
    }
}