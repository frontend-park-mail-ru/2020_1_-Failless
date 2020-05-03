'use strict';

import View from 'Eventum/core/view';
import searchTemplate from 'Components/big-search/template.hbs';
import searchGridTemplate from 'Blocks/search-grid/template.hbs';
import {makeEmpty} from 'Eventum/utils/basic';
import {determineClass} from 'Blocks/re--event/event';

/**
 * @class create SearchView class
 */
export default class SearchView extends View {

    /**
     * Create view
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.parent = parent;
        this.resultsArea = null;
    }

    destructor() {
        this.resultsArea = null;
    }

    /**
     * Check if elements are set and return div of results area
     * @return {Element}
     */
    get resultsAreaDiv() {
        this.#setDOMElements();
        return this.resultsArea;
    }

    /**
     * Render template
     */
    render() {
        this.parent.insertAdjacentHTML('beforeend', searchTemplate());
        this.#setDOMElements();
    }

    #setDOMElements = () => {
        while (!this.resultsArea) {
            this.resultsArea = document.querySelector('.big-search__results');
        }
    };

    showSearchError = (message) => {
        this.showError(this.resultsAreaDiv, message, 'warning', null);
    };

    renderResults(events) {
        console.log(events);
        const resultsArea = this.resultsAreaDiv;
        makeEmpty(resultsArea);
        if (events) {
            events.forEach((event) => determineClass(event.Event));
        }
        resultsArea.insertAdjacentHTML('afterbegin', searchGridTemplate({events}));
    }

    renderNotFound() {
        const resultsArea = this.resultsAreaDiv;
        makeEmpty(resultsArea);
        this.showError(resultsArea, 'Ничего не нашлось ', 'sad', null).then();
    }
}
