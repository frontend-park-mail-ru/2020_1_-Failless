'use strict';

import Controller from 'Eventum/core/controller';
import SignUpView from 'Eventum/views/signup-view';
import UserModel from 'Eventum/models/user-model';
import ValidationModule from 'Eventum/utils/validation';
import Router from 'Eventum/core/router';
import Snackbar from 'Blocks/snackbar/snackbar';
import TextConstants from 'Eventum/utils/language/text';

export default class SignUpController extends Controller {

    /**
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.view = new SignUpView(parent);
        this.form = null;
        this.inputs = null;
        this.pending = false;
        this.inputManager = {
            braces: false,
            i: 0,
            text: '+7(XXX)XXX-XX-XX',
            three: false,
        }
    }

    destructor() {
        this.view.destructor();
        super.destructor();
    }

    /**
     * Create base business logic of SignUp
     */
    action() {
        UserModel.getLogin().then((user) => {
            if (!user) {
                return;
            }
            if (Object.prototype.hasOwnProperty.call(user, 'uid')) {
                Router.redirectForward('/');
                return;
            }
            super.action();
            this.view.render();
            this.#initView();
            this.initHandlers([
                {
                    attr: 'signup',
                    events: [
                        {type: 'submit', handler: this.#signUpSubmitHandler},
                    ]
                },
                {
                    attr: 'checkInput',
                    many: true,
                    events: [
                        {type: 'focus', handler: this.removeErrorMessage},
                        {type: 'blur', handler: this.#checkInputHandler},
                        {type: 'keydown', handler: this.#inputComponent},
                    ]
                }
            ]);
        });
    }

    /**
     * Initialize view
     */
    #initView() {
        let auth = document.body.getElementsByClassName('auth')[0];
        if (auth) {
            this.form = document.getElementById('form');
        }
    }

    /**
     * Get data from input form on sign up page
     * @param {Event} event
     * @return {{password: *, phone: *, name: *, email: *}} input form
     */
    #getFromSignUp() {
        const name = this.form[0].value;
        const email = this.form[1].value;
        const phone = this.form[2].value;
        const password = this.form[3].value;
        const repeatPassword = this.form[4].value;

        let errors_list = [];
        errors_list.push(ValidationModule.validateUserData(name, 'name'));
        errors_list.push(ValidationModule.validateUserData(email, 'email'));
        errors_list.push(ValidationModule.validateUserData(phone, 'phone'));
        errors_list.push(ValidationModule.validateUserData(password, 'password'));
        errors_list.push(ValidationModule.validateUserData(repeatPassword, 'repeatPassword'));
        if (repeatPassword !== password) {
            errors_list.push(TextConstants.AUTH__PASS_ERROR);
        }

        if (errors_list.some(val => val.length !== 0)) {
            return void 0;
        }

        return {name, password, phone, email};
    };

    /**
     * Handle click on submit event
     * @param {Event} event
     */
    #signUpSubmitHandler = (event) => {
        event.preventDefault();

        if (this.pending) {
            return;
        }

        const body = this.#getFromSignUp();
        if (!body) {
            return;
        }
        this.removeErrorMessage(event);

        this.pending = true;
        this.view.showGlobalLoading();

        UserModel.postSignUp(body).then(
            (response) => {
                this.pending = false;
                this.view.removeGlobalLoading();

                if (Object.prototype.hasOwnProperty.call(response, 'name')) {
                    Snackbar.instance.addMessage(TextConstants.AUTH__SUCCESSFUL_SIGNUP);
                    setTimeout(() => {
                        Router.redirectForward('/login');
                    }, 1000);
                } else {
                    this.view.addErrorMessage(this.form, [response.message]);
                }
            },
            (reason) => {
                this.pending = false;
                this.view.removeGlobalLoading();
            });
    };

    /**
     * Handle blur event
     * @param {Event} event
     */
    #checkInputHandler = (event) => {
        const name = this.form[0].value;
        const email = this.form[1].value;
        const phone = this.form[2].value;
        const password = this.form[3].value;
        const repeatPassword = this.form[4].value;

        switch (true) {
            case (event.target === this.form[0]):
                const nameCheck = ValidationModule.validateUserData(name, 'name');
                this.view.addErrorMessage(this.form[0], nameCheck);
                break;
            case (event.target === this.form[1]):
                const emailCheck = ValidationModule.validateUserData(email, 'email');
                this.view.addErrorMessage(this.form[1], emailCheck);
                break;
            case (event.target === this.form[2]):
                const phoneCheck = ValidationModule.validateUserData(phone, 'phone');
                this.view.addErrorMessage(this.form[2], phoneCheck);
                break;
            case (event.target === this.form[3]):
                const passwordCheck = ValidationModule.validateUserData(password, 'password');
                this.view.addErrorMessage(this.form[3], passwordCheck);

                if (repeatPassword !== password) {
                    this.view.addErrorMessage(this.form[4], [TextConstants.AUTH__PASS_ERROR]);
                }
                break;
            case (event.target === this.form[4]):
                const repeatPasswordCheck = ValidationModule.validateUserData(repeatPassword, 'repeatPassword');
                if (repeatPassword !== password) {
                    repeatPasswordCheck.push(TextConstants.VALID__PASS_NO_MATCH);
                }
                this.view.addErrorMessage(this.form[4], repeatPasswordCheck);
                break;
        }
    };

    // Method inheritance doesn't work due to arrow functions :c
    removeErrorMessage = (event) => {
        event.preventDefault();

        if (event.target === this.form[3]) {
            this.form[4].classList.remove('input__auth_incorrect');
            let errorElement = this.form[4].parentNode.getElementsByClassName('validation-error')[0];
            if (errorElement) {
                errorElement.remove();
            }
        }

        event.target.classList.remove('input__auth_incorrect');
        let errorElement = event.target.parentNode.getElementsByClassName('validation-error')[0];
        if (errorElement) {
            errorElement.remove();
        }
    };

    #inputComponent = (event) => {
        if (event.target.id !== 'phone') {
            return;
        }
        if ((event.which < 48 || event.which > 57) && event.code !== 'Backspace') {
            if (event.code === 'Tab') {
                return;
            }
            event.preventDefault();
            return;
        }


        const input = this.view.getPhone();
        console.log(input);
        this.inputManager.text = input;
        if (event.code === 'Backspace') {
            switch (this.inputManager.i) {
                case 2:
                case 6:
                case 10:
                case 13: {
                    this.inputManager.text = this.inputManager.text.substr(0, this.inputManager.text.length - 2);
                    this.inputManager.i = this.inputManager.text.length;
                    break;
                }
                default: {
                    console.warn('strange len');
                    console.warn(input);
                }
            }
            this.view.updatePhone(this.inputManager.text);
            return;
        }
        if (this.inputManager.i === 0) {
            this.inputManager.text = '(' + this.inputManager.text;
            this.inputManager.i++;
        } else if (this.inputManager.i === 4) {
            this.inputManager.text = this.inputManager.text + ')';
            this.inputManager.i++;
        } else if (this.inputManager.i === 8 || this.inputManager.i === 11) {
            this.inputManager.text = this.inputManager.text + '-';
            this.inputManager.i++;
        }
        this.inputManager.i++;

        // const area = input.substr(0, 3);
        // const pre = input.substr(3, 3);
        // const tel = input.substr(6, 4);
        // let output = '';
        // if (area.length < 3) {
        //     output = '(' + area;
        // } else if (area.length === 3 && pre.length < 3) {
        //     output = '(' + area + ')' + ' ' + pre;
        // } else if (area.length === 3 && pre.length === 3) {
        //     output = '(' + area + ')' + ' ' + pre + '-' + tel;
        // }
        this.view.updatePhone(this.inputManager.text);
    };
}
