'use strict';

import validationErrorTemplate from 'Blocks/validation-error/template.hbs';
import errorTemplate from 'Blocks/error/template.hbs';
import loadingTemplate from 'Blocks/loading/template.hbs';
import {makeEmpty} from 'Eventum/utils/basic.js';
import {icons} from 'Eventum/utils/static-data.js';

/**
 * Base view class
 */
export default class View {

    /**
     * Create view
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        this.parent = parent;
    }

    /**
     * Render template
     */
    render() {
    }

    /**
     * Add error message
     * @param {HTMLElement} element - html element
     * @param {string[]} messageValue - array of validation errors
     */
    addErrorMessage(element, messageValue) {
        if (messageValue.length === 0) {
            return;
        }

        element.classList.add('input__auth_incorrect');
        element.insertAdjacentHTML('beforebegin', validationErrorTemplate({message: messageValue[0]}));
    }

    /**
     * Show Server error inside an element
     * !use with caution!
     * @param {HTMLElement} element
     * @param {String} message
     * @return {Promise<void>}
     */
    async showServerError(element, message) {
        makeEmpty(element);
        element.insertAdjacentHTML('beforeend', errorTemplate({
            icon:   icons.get('warning'),
            message: message,
        }));
    }

    /**
     * Show loading animation inside an element
     * @param element
     * @return {Promise<void>}
     */
    async showLoading(element) {
        makeEmpty(element);
        element.insertAdjacentHTML('beforeend', loadingTemplate());
    }
}
