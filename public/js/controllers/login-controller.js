'use strict';

import Controller from 'Eventum/core/controller.js';
import LoginView from 'Eventum/views/login-view.js';
import UserModel from 'Eventum/models/user-model.js';
import ValidationModule from 'Eventum/utils/validation.js'

/**
 * @class LoginController
 */
export default class LoginController extends Controller {

    /**
     * construct object of LoginController class
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.view = new LoginView(parent);

        this.form = null;
        this.inputs = null;
    }

    action() {
        super.action();
        this.view.render();
        this.#initView();
    }

    #initView() {
        let auth = document.body.getElementsByClassName('auth')[0];
        if (auth) {
            this.form = document.getElementById('form');
            this.addEventHandler(this.form, 'submit', this.#loginSubmitHandler);

            this.inputs = this.form.getElementsByClassName('input input__auth');
            for (let input of this.inputs) {
                this.addEventHandler(input, 'focus', this.#removeErrorMessage);
                this.addEventHandler(input, 'blur', this.#checkInputHandler);
            }
        }
    }

    _showSetEventModal(event) {
        document.getElementsByClassName('modal__container')[0].style.display = 'flex';
    };

    _hideSetEventModal(event) {
        document.getElementsByClassName('modal__container')[0].style.display = 'none';
    };

    /**
     * Get data from input form on sign up page
     * @return {{password: *, phone: *, name: *, email: *}} input form
     */
    #getFromLogin() {
        const login = this.form[0].value;
        let phone = '';
        let email = '';
        const password = this.form[1].value;

        let errors_list = [];
        if (login.includes('@')) {
            email = login;
            errors_list.push(ValidationModule.validateUserData(email, 'email'));
        } else {
            phone = login;
            errors_list.push(ValidationModule.validateUserData(phone, 'phone'));
        }
        
        if (errors_list.some(val => val.length !== 0)) {
            return void 0;
        }

        return {phone, email, password};
    }

    #checkInputHandler = (event) => {
        event.preventDefault();

        const login = this.form[0].value;

        switch(true) {
            case (event.target === form[0] && login.includes('@')):
                const nameCheck = ValidationModule.validateUserData(login, 'email');
                this.#addErrorMessage(form[0], nameCheck);
                break;
            case (event.target === form[0]):
                const emailCheck = ValidationModule.validateUserData(login, 'phone');
                this.#addErrorMessage(form[0], emailCheck);
                break;
        }
    };

    #addErrorMessage(element, messageValue) {
        if (messageValue.length === 0) {
            return;
        }

        element.classList.add('input__auth_incorrect');
        element.insertAdjacentHTML('beforebegin',
            Handlebars.templates['validation-error']({message: messageValue[0]}));
    };

    #removeErrorMessage = (event) => {
        event.preventDefault();

        event.target.classList.remove('input__auth_incorrect');
        let errorElement = event.target.parentNode.getElementsByClassName('validation-error')[0];
        if (errorElement) {
            errorElement.remove();
        }
    };

    /**
     * Handle click on login event
     * @param {event} event
     */
    #loginSubmitHandler = (event) => {
        event.preventDefault();

        const body = this.#getFromLogin();

        if (!body) {
            console.log('do nothing');
            return;
        }

        this.#removeErrorMessage(event);

        UserModel.postLogin(body).then((user) => {
            if (Object.prototype.hasOwnProperty.call(user, 'name')) {
                window.history.pushState({}, '', '/my/profile');
                window.history.pushState({}, '', '/my/profile');
                window.history.back();
            } else {
                console.log(response);
                this.#addErrorMessage(this.form[0], [response.message]);
            }
        });
    };
}