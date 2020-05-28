'use strict';

import ProfileView from 'Eventum/views/profile-view';
import UserModel from 'Eventum/models/user-model';
import ProfileEditView from 'Eventum/views/profile-edit-view';
import ModalView from 'Eventum/views/modal-view';
import {STATIC_TAGS} from 'Eventum/utils/static-data';
import {highlightTag} from 'Eventum/utils/tag-logic';
import {logoutRedirect} from 'Eventum/utils/user-utils';
import EventModel from 'Eventum/models/event-model';
import imageEditTemplate from 'Blocks/image-edit/template.hbs';
import {resizeTextArea} from 'Eventum/utils/basic';
import Router from 'Eventum/core/router';
import Controller from 'Eventum/core/controller';
import {CircleRedirect} from 'Blocks/circle/circle';
import {toggleActionText} from 'Blocks/event/event';
import settings from 'Settings/config';
import Snackbar from 'Blocks/snackbar/snackbar';
import TextConstants from 'Eventum/utils/language/text';
import MatchModel from 'Eventum/models/match-model';
import NotificationController from 'Eventum/controllers/notification-controller';

/**
 * @class ProfileController
 */
export default class ProfileController extends Controller {

    /**
     * construct object of ProfileController class
     * @param parent {HTMLElement}
     */
    constructor(parent) {
        super(parent);
        this.view = new ProfileView(parent);
        this.MatchModel = null;
        this.editView = null;
        this.image = '';
        this.user = null;
        this.activeModalWindow = null;
        this.images = [];
    }

    destructor() {
        this.view.destructor();
        super.destructor();
    }

    /**
     * Create action
     */
    action() {
        super.action();
        // todo: check is user allowed to see this
        UserModel.getProfile()
            .then((profile) => {
                if (!profile) {
                    console.error('Server error');
                    console.log(profile);
                    return;
                }
                if (Object.prototype.hasOwnProperty.call(profile, 'about')) {
                    // Prepare profile photos
                    if (profile.photos) {
                        profile.photos = profile.photos.map(photo => {
                            return {
                                src: `${settings.aws}/users/${photo.path}`,
                                alt: photo.path,
                                data_photo_id: this.images.push({img: photo.path, state: 'old'}),
                            };
                        });
                    }

                    this.MatchModel = new MatchModel();
                    this.MatchModel.establishConnection(profile.uid, this.receiveMessage).then(
                        (response) => {
                            console.log(response);
                        }
                    );
                    this.view.render(profile);
                    EventModel.getUserOwnEvents(profile.uid).then(
                        (events) => {
                            this.view.renderEvents(events);
                        },
                        (error) => {
                            this.view.renderEventsError(error);
                        }
                    );
                    EventModel.getUserSubscriptions(profile.uid).then(
                        (subscriptions) => {
                            this.view.renderSubscriptions(subscriptions);
                        },
                        (error) => {
                            this.view.renderSubscriptionsError(error);
                        }
                    );
                    (async () => {
                        this.view.leftHeaderDiv.querySelectorAll('.circle')[2].classList.add('circle_active');
                    })();
                    this.user = profile;

                    this.initHandlers([
                        {
                            attr: 'logout',
                            events: [
                                {type: 'click', handler: logoutRedirect},
                            ]
                        },
                        {
                            attr: 'photoUpload',
                            many: true,
                            events: [
                                {type: 'change', handler: this.#handlePreviewImages},
                            ]
                        },
                        {
                            attr: 'saveAbout',
                            events: [
                                {type: 'blur', handler: this.#saveAbout}
                            ]
                        },
                        {
                            attr: 'showSettings',
                            events: [
                                {type: 'click', handler: this.#profileSettings},
                            ]
                        },
                        {
                            attr: 'showModalTags',
                            many: true,
                            events: [
                                {type: 'click', handler: this.#showModalTags},
                            ]
                        },
                        {
                            attr: 'removeTags',
                            events: [
                                {type: 'click', handler: this.#removeTags},
                            ]
                        },
                        {
                            attr: 'showAddEvent',
                            events: [
                                {
                                    type: 'click', handler: () => {
                                        this.view.eventEditComp.show();
                                    }
                                },
                            ]
                        },
                        {
                            attr: 'circleRedirect',
                            events: [
                                {type: 'click', handler: CircleRedirect},
                            ]
                        },
                        {
                            attr: 'resizeTextArea',
                            many: true,
                            events: [
                                {type: 'input', handler: resizeTextArea},
                            ]
                        },
                        {
                            attr: 'removeUserImage',
                            events: [
                                {type: 'click', handler: this.#removeUserImage},
                            ]
                        },
                        {
                            attr: 'addNewEventOnClick',
                            events: [
                                {type: 'click', handler: this.#submitNewEvent}
                            ]
                        },
                        {
                            attr: 'cancelNewEvent',
                            events: [
                                {
                                    type: 'click', handler: () => {
                                        this.view.eventEditComp.hide();
                                    }
                                }
                            ]
                        },
                        {
                            attr: 'previewImagesForEvent',
                            events: [
                                {type: 'change', handler: this.#previewImagesForEvent}
                            ]
                        },
                        {
                            attr: 'removePreviewImage',
                            events: [
                                {
                                    type: 'click', handler: (event) => {
                                        if (event.target.matches('.image-edit__close-icon_inner')) {
                                            this.view.eventEditComp.removePreviewImage(event.target);
                                        }
                                    }
                                },
                            ]
                        },
                        {
                            attr: 'showAction',
                            events: [
                                {
                                    type: 'mouseover', handler: (event) => {
                                        if (event.target.matches('.event__link.font__color_green')) {
                                            toggleActionText(event.target, TextConstants.EVENT__LEAVE);
                                        }
                                    }
                                },
                                {
                                    type: 'click', handler: (event) => {
                                        if (event.target.matches('.event__link.font__color_red')) {
                                            this.#unfollowEvent(event.target);
                                        } else if (event.target.matches('button.error__button')) {
                                            Router.redirectForward('/search');
                                        }
                                    }
                                },
                                {
                                    type: 'mouseout', handler: (event) => {
                                        if (event.target.matches('.event__link.font__color_red')) {
                                            toggleActionText(event.target, TextConstants.EVENT__YOU_GO);
                                        }
                                    }
                                },
                            ]
                        },
                    ]);
                } else {
                    console.error('You have no rights for this page');
                    console.log(profile);
                }
            }).catch(onerror => {
                console.error(onerror);
            });
    }

    /***********************************************
                        Meta info
     ***********************************************/

    #saveAbout = (event) => {
        // TODO: check if it's save
        UserModel.putAbout(event.target.value)
            .catch(Snackbar.instance.addMessage);
    };

    #removeTags = (event) => {
        let tagButton = event.target.closest('.tag__button');
        if (!tagButton) {
            return;
        }
        const tags = this.view.tagsDiv.querySelectorAll('.tag');
        let tagContainer = event.target.closest('.tag__container');
        const tagToRemove = Number(tagContainer.firstElementChild.getAttribute('data-id'));
        let selectedTags = [];
        tags.forEach((tag) => {
            let tagToPush = Number(tag.getAttribute('data-id'));
            if (tagToPush !== tagToRemove) {
                selectedTags.push(tagToPush);
            }
        });
        tagContainer.style.transform = 'scale(0)';
        setTimeout(() => {
            tagContainer.remove();
            if (this.view.tagsDiv.childElementCount === 0) {
                this.view.renderEmptyTags();
            }
        }, 300);
        UserModel.putTags(selectedTags)
            .catch(Snackbar.instance.addMessage);
    };

    #submitTagsHandler = (event) => {
        event.preventDefault();
        let activeTags = this.activeModalWindow.querySelectorAll('.tag__container.tag__container_active');
        let activeTagIDs = [];
        if (activeTags) {
            activeTags.forEach(tag => {
                activeTagIDs.push(+tag.firstElementChild.getAttribute('data-id'));
            });
        }
        Promise.all([
            this.view.renderTags(activeTagIDs),
            UserModel.putTags(activeTagIDs),
        ]).catch(console.error);
        this.editView.clear();
        this.editView = null;
    };

    async #uploadImages() {
        // Get all images
        let images = this.activeModalWindow.querySelectorAll('.image-edit');
        let requestImages = [];
        if (images) {
            images.forEach(image => {
                let src = image.querySelector('img').src;
                if (src.startsWith('https://')) {
                    requestImages.push({img: '', path: src.slice((`${settings.aws}/users/`).toString().length)});
                } else {
                    requestImages.push({img: src.split(';')[1].split(',')[1], path: ''});
                }
            });
        }
        console.log(requestImages);

        Promise.all([
            UserModel.putPhotos(requestImages),
            this.view.showLoading(this.view.photosColumn),
        ]).then(responses => {
            this.view.renderPhotos(responses[0]);
        }).catch(Snackbar.instance.addMessage);
    };

    /***********************************************
                         Events
     ***********************************************/

    #previewImagesForEvent = (event) => {
        if (event.target.files && event.target.files[0]) {
            let FR = new FileReader();
            FR.addEventListener('load', this.view.eventEditComp.previewImages());
            FR.readAsDataURL(event.target.files[0]);
        }
    };

    #unfollowEvent = (linkElement) => {
        UserModel.getProfile().then(
            (profile) => {

                let eid = linkElement.getAttribute('data-eid');

                let eventIndexAndSource = this.view.findEventComponentIndex(Number(eid));

                if (eventIndexAndSource.index === -1) {
                    console.error('No component was found');
                    // TODO: do sth
                    return;
                }

                let eventComponent = eventIndexAndSource.source[eventIndexAndSource.index];

                if (eventComponent.type === 'mid') {
                    EventModel.leaveMidEvent(profile.uid, eid)
                        .then((response) => {
                            eventComponent.removeComponent('smooth');
                            eventIndexAndSource.source = eventIndexAndSource.source.splice(eventIndexAndSource.index, 1);
                        });
                } else {
                    Snackbar.instance.addMessage('we dont support that type yet');
                    console.log('we dont support that type yet');
                }
            },
            error => console.error(error)
        );
    };

    #submitNewEvent = (event) => {
        // Validate data
        const eventEditComp = this.view.eventEditComp;
        let data = eventEditComp.retrieveData();
        if (!eventEditComp.validateData(data)) {
            // TODO: show error
            console.log('title is empty');
            return;
        }

        // Submit form to backend
        let request = {
            title: data.title,
            description: data.about === '' ? null : data.about,
            limit: data.limit,
            date: data.time === '' ? null : new Date(data.time).toISOString(),
            photos: data.photos,
            public: data.public,
        };

        UserModel.getProfile().then(profile => {
            request.uid = +profile.uid;
            if (data.limit === 2) {
                request.tags = data.tags;
                Promise.all([
                    EventModel.createSmallEvent(request),
                    this.view.renderNewEventLoading(),
                ]).then(responses => {
                    this.view.renderNewEvent(responses[0], 'small', responses[1]);
                }).catch(console.error);
            } else {
                request.tag_id = data.tags[0];
                request.private = true;
                request.type = null;
                Promise.all([
                    EventModel.createMidEvent(request),
                    this.view.renderNewEventLoading(),
                ]).then(responses => {
                    this.view.renderNewEvent(responses[0], 'mid', responses[1]);
                }).catch(console.error);
            }
            eventEditComp.hide();
        });
    };

    /***********************************************
     User photos
     ***********************************************/

    #handlePreviewImages = (event) => {
        if (event.target.files && event.target.files[0]) {
            let FR = new FileReader();
            this.addEventHandler(FR, 'load', () => {this.#previewPhotos(event.target);});
            FR.readAsDataURL(event.target.files[0]);
        }
    };

    /**
     * Preview selected image and draw manage buttons
     * @param {HTMLInputElement} input
     */
    #previewPhotos = (input) => {
        const files = input.files;
        if (!files || files.length === 0) {
            console.log('empty files');
            return;
        }

        // Show modal window
        this.editView = new ModalView(document.body);
        this.editView.render({
            additional_class: 'modal__body_photos',
            title: TextConstants.PROFILE__YOUR_PHOTOS,
            last_buttons: [{title: TextConstants.BASIC__SAVE}]
        });

        let modalBG = document.body.querySelector('.modal__bg');
        this.activeModalWindow = modalBG.firstElementChild;
        const body = this.activeModalWindow.querySelector('.modal__body');

        // Render old images
        let oldPhotos = this.view.photosColumn.querySelectorAll('.image-edit');
        if (oldPhotos) {
            oldPhotos.forEach(photoElement => {
                body.insertAdjacentElement('beforeend', photoElement);
            });
        }

        // Adding event handlers
        modalBG.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        modalBG.addEventListener('scroll', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        body.addEventListener(
            'click', this.#removePreviewImage, false);
        this.activeModalWindow.querySelector('.modal__header-icon').addEventListener(
            'click', (event) => {
                event.preventDefault();
                // Render old photos back
                if (oldPhotos) {
                    oldPhotos.forEach(photoElement => {
                        this.view.photosColumn.insertAdjacentElement('beforeend', photoElement);
                    });
                }
                this.editView.clear();
                this.editView = null;
            });
        this.activeModalWindow.querySelector('[data-bind-event="modalWindowAction"]').addEventListener(
            'click', () => {
                this.#uploadImages().then();
                this.editView.clear();
                this.editView = null;
            });

        // Render new images
        for (let iii = 0; iii < files.length; iii++) {
            const FR = new FileReader();

            FR.addEventListener('load', (event) => {
                this.images.push(event.target.result.split(';')[1].split(',')[1]);
                body.insertAdjacentHTML('beforeend', imageEditTemplate({
                    src: event.target.result,
                }));
            });

            FR.readAsDataURL(files[iii]);
        }
    };

    #removeUserImage = (event) => {
        if (event.target.classList.contains('image-edit__close-icon')
            ||
            event.target.classList.contains('image-edit__close-icon_inner')) {
            let imageEditDiv = event.target.closest('.image-edit');
            imageEditDiv.style.display = 'none';
            const images = this.view.photosColumn.querySelectorAll('.image-edit');
            const requestImages = [];
            let changeAvatar = false;
            images.forEach((image, index) => {
                if (image.style.display !== 'none') {
                    requestImages.push({img: '', path: image.lastElementChild.src.slice((`${settings.aws}/users/`).toString().length)});
                } else if (index === 0) {
                    changeAvatar = true;
                }
            });
            UserModel.putPhotos(requestImages);
            imageEditDiv.remove();
            if (images.length === 1) {
                this.view.renderEmptyPhotos();
            } else if (changeAvatar) {
                this.view.renderAvatar();
            }
        }
    };

    #removePreviewImage = (event) => {
        if (event.target.classList.contains('image-edit__close-icon')
            ||
            event.target.classList.contains('image-edit__close-icon_inner'))
        {
            let imageEditDiv = event.target.closest('.image-edit');
            imageEditDiv.remove();
        }
    };

    // TODO: move it to view
    /**
     * Show modal window with tags settings
     * @param {Event} event
     */
    #showModalTags = (event) => {
        event.preventDefault();
        this.editView = new ModalView(document.body);
        let tags = STATIC_TAGS.map((tag) => {
            tag.editable = true;
            tag.activeClass = '';
            return tag;
        });
        console.log(tags);
        this.editView.render({
            title: TextConstants.PROFILE__YOUR_TAGS,
            tags: tags,
            last_buttons: [{title: 'ОК'}]
        });

        // Adding event handlers
        let modalBG = document.body.querySelector('.modal__bg');
        modalBG.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        modalBG.addEventListener('scroll', (event) => {
            event.preventDefault();
            event.stopPropagation();
        });
        this.activeModalWindow = modalBG.firstElementChild;
        this.activeModalWindow.querySelector('.modal__body').addEventListener(
            'click', highlightTag, false);
        this.activeModalWindow.querySelector('.modal__header-icon').addEventListener(
            'click', (event) => {
                event.preventDefault();
                this.editView.clear();
                this.editView = null;
            });

        let activeTags = null;
        let submitHandler = null;
        if (event.target.matches('a')) {
            activeTags = this.view.leftColumnDiv.querySelectorAll('.tag__container.tag__container_active');
            submitHandler = this.#submitTagsHandler;
        } else {
            activeTags = this.view.eventEditComp.element.querySelectorAll('.tag__container');
            submitHandler = (event) => {
                event.preventDefault();
                let finalTags = [];
                let activatedTags = this.activeModalWindow.querySelectorAll('.tag__container_active');
                if (activatedTags && activatedTags.length > 0) {
                    activatedTags.forEach((tag) => {
                        finalTags.push({
                            activeClass: 'tag__container_active',
                            tag_id: tag.firstElementChild.getAttribute('data-id'),
                            name: tag.firstElementChild.innerText.slice(1),
                        });
                    });
                }
                this.view.eventEditComp.addTags(finalTags);
                this.editView.clear();
                this.editView = null;
            };
        }

        // Rendering active tags in modal view
        if (activeTags && activeTags.length > 0) {
            let activeTagIds = [];
            activeTags.forEach((activeTag) => {
                activeTagIds.push(+activeTag.firstElementChild.getAttribute('data-id'));
            });
            this.activeModalWindow.querySelectorAll('.tag__container').forEach((tag) => {
                if (activeTagIds.includes(+tag.firstElementChild.getAttribute('data-id'))) {
                    tag.classList.add('tag__container_active');
                }
            });
        }

        // Submit event handler
        this.activeModalWindow.querySelector(
            '.modal__footer').querySelector(
            '.re_btn.re_btn__outline').addEventListener(
            'click', submitHandler, false);
    };

    /***********************************************
     Profile settings
     ***********************************************/

    /**
     * Create profile settings popup
     * @param {Event} event
     */
    #profileSettings = (event) => {
        event.preventDefault();
        this.editView = new ProfileEditView(this.parent);
        this.editView.render(this.user);
        const closeBtn = document.querySelector('.profile-edit__icon');
        this.addEventHandler(closeBtn, 'click', this.#removeProfileSettings);
        const table = document.querySelector('.profile-edit__table');
        this.addEventHandler(table, 'click', this.#drawUnfoldedLine);
    };


    /**
     * Remove profile settings popup
     * @param {Event} event
     */
    #removeProfileSettings = (event) => {
        const popup = document.querySelector('.profile-edit');
        popup.parentNode.removeChild(popup);
        document.removeEventListener('click', this.#removeProfileSettings);
    };

    /**
     *
     * @param {Event} event
     */
    #drawUnfoldedLine = (event) => {
        event.preventDefault();
        console.log(event.target);
        if (event.target.tagName === 'A') {
            let filed = event.target.parentNode;
            switch (filed.id) {
            case 'popupPasswd': {
                console.log('draw password field');
                this.editView.renderPasswordForm(filed);
                break;
            }
            case 'popupMail': {
                console.log('draw email field');
                break;
            }
            case 'popupSex': {
                console.log('draw gender field');
                break;
            }
            case 'popupPhone': {
                console.log('draw phone field');
                break;
            }
            case 'popupLang': {
                console.log('draw lang field');
                break;
            }
            case 'popupBirth': {
                console.log('draw lang field');
                break;
            }
            }
        }
    };

    receiveMessage = (event) => {
        // Check where to insert the message
        console.log(event.data);
        let message = JSON.parse(event.data);
        console.log(message);
        if (this.uid !== message.uid) {
            NotificationController.notify(TextConstants.FEED__NEW_MATCH);
        }
    };

}
