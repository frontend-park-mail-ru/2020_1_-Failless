'use strict';

import View from '../core/view.js';

/**
 *
 */
export default class SignUpView extends View {

    /**
     * Create view
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.parent = parent;
    }

    /**
     * Render template
     */
    render() {
        // const template = [
        //     {
        //         block: 'auth',
        //         content: [
        //             {
        //                 elem: 'item',
        //                 mix: {block: 'auth__item_main'},
        //                 content: [
        //                     {
        //                         elem: 'title',
        //                         mix: {block: 'auth__title_main'},
        //                         content: 'Регистрация',
        //                     },
        //                     {
        //                         tag: 'form',
        //                         attrs: {id: 'form'},
        //                         content: [
        //                             {
        //                                 elem: 'input',
        //                                 content: [
        //                                     {
        //                                         elem: 'help',
        //                                         content: 'Имя',
        //                                     },
        //                                     {
        //                                         block: 'input',
        //                                         mix: {'block': 'input__auth'},
        //                                         tag: 'input',
        //                                         attrs: {placeholder: 'Илья', type: 'text'},
        //                                     },
        //                                 ]
        //                             },
        //                             {
        //                                 elem: 'input',
        //                                 content: [
        //                                     {
        //                                         elem: 'help',
        //                                         content: 'Email',
        //                                     },
        //                                     {
        //                                         block: 'input',
        //                                         mix: {'block': 'input__auth'},
        //                                         tag: 'input',
        //                                         attrs: {placeholder: 'ilya@mail.com', type: 'email'},
        //                                     },
        //                                 ]
        //                             },
        //                             {
        //                                 elem: 'input',
        //                                 content: [
        //                                     {
        //                                         elem: 'help',
        //                                         content: 'Телефон',
        //                                     },
        //                                     {
        //                                         block: 'input',
        //                                         mix: {'block': 'input__auth'},
        //                                         tag: 'input',
        //                                         attrs: {placeholder: '+7 (999) 555-35-35', type: 'tel'},
        //                                     },
        //                                 ]
        //                             },
        //                             {
        //                                 elem: 'input',
        //                                 content: [
        //                                     {
        //                                         elem: 'help',
        //                                         content: 'Пароль',
        //                                     },
        //                                     {
        //                                         block: 'input',
        //                                         mix: {'block': 'input__auth'},
        //                                         tag: 'input',
        //                                         attrs: {placeholder: '*******', type: 'password'},
        //                                     },
        //                                 ]
        //                             },
        //                             {
        //                                 elem: 'input',
        //                                 content: [
        //                                     {
        //                                         elem: 'help',
        //                                         content: 'Повтороите пароль',
        //                                     },
        //                                     {
        //                                         block: 'input',
        //                                         mix: {'block': 'input__auth'},
        //                                         tag: 'input',
        //                                         attrs: {placeholder: '*******', type: 'password'},
        //                                     },
        //                                 ]
        //                             },
        //                             {
        //                                 elem: 'btn',
        //                                 content: [{
        //                                     block: 'btn',
        //                                     mods: {color: 'ok', size: 'large'},
        //                                     btnText: 'Зарегестриророваться',
        //                                     attrs: {type: 'submit'},
        //                                 }],
        //                             }
        //                         ],
        //                     },
        //                 ],
        //             },
        //             {
        //                 elem: 'item',
        //                 content: [
        //                     {
        //                         elem: 'title',
        //                         content: 'Вход',
        //                     },
        //                     {
        //                         elem: 'text',
        //                         content: 'Уже зарегистрированы?\n' +
        //                             'Войдите с существующим аккаунтом!',
        //                     },
        //                     {
        //                         elem: 'btn',
        //                         content: [{
        //                             block: 'btn',
        //                             mods: {color: 'w', size: 'middle'},
        //                             btnText: 'Войти',
        //                             color: 'blue',
        //                             attrs: {type: 'submit'},
        //                         }],
        //                     }
        //                 ],
        //             }
        //         ]
        //     }
        // ];

        const signup = Handlebars.templates['auth']({
            blocks: [
                {
                    main: true,
                    title: 'Регистрация',
                    fields: [
                        {
                            name: 'Имя',
                            help: 'Илья',
                            type: 'text',
                        },
                        {
                            name: 'Email',
                            help: 'ilya@mail.com',
                            type: 'email',
                        },
                        {
                            name: 'Телефон',
                            help: '+7 (999) 555-35-35',
                            type: 'tel',
                        },
                        {
                            name: 'Пароль',
                            help: '******',
                            type: 'password',
                        },
                        {
                            name: 'Повторите пароль',
                            help: '******',
                            type: 'password',
                        }
                    ],
                    button: 'Зарегистрироваться',
                },
                {
                    main: false,
                    title: 'Вход',
                    help: 'Уже зарегистрированы? Войдите с существующим аккаунтом!',
                    button: 'Войти',
                },
            ],
        });

        this.parent.insertAdjacentHTML('beforeend', signup);
    }
}