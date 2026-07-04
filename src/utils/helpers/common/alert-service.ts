import Swal, { SweetAlertPosition } from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css";

import { errorMessages } from "../enums/messages.enum"

export const successToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text,
        icon: 'success',
        background: 'white',
        color: 'var(--black-constant)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
    })
}

export const warningToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text,
        icon: 'warning',
        background: 'white',
        color: 'var(--black-constant)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
    })
}

export const errorToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text: text ?? errorMessages.somethingWentWrong,
        icon: 'error',
        background: 'white',
        color: 'var(--black-constant)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
    })
}

export const errorToasterAutoClose = (title: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        title,
        icon: 'error',
        background: 'white',
        color: 'var(--black-text)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        timer: 5000,
        position
    })
}

export const confirmationPopup = async (title: string = 'warningMessages.confirmationDefaultMsg', text?: string) => {
    return Swal.fire({
        title,
        icon: 'question',
        background: 'white',
        color: 'var(--black-text)',
        showCancelButton: true,
        confirmButtonColor: 'rgb(44 70 87)',
        cancelButtonColor: '#CED4DA',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    });
}
export const priorDownloadConfirmationPopup = async (title: string = 'Are you sure you want to download?', text?: string) => {
    return Swal.fire({
        title,
        icon: 'question',
        background: 'var(--alert-popup-bg)',
        color: 'var(--black-text)',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--reset-button-bg)',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
    });
}
export const customConfirmationPopup = async (title: string, confirmButtonText: string, cancelButtonText: string) => {
    return Swal.fire({
        title,
        icon: 'question',
        background: 'var(--alert-popup-bg)',
        color: 'var(--black-text)',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--reset-button-bg)',
        confirmButtonText,
        cancelButtonText,
        allowOutsideClick: false
    });
}

export const infoPopup = async (title: string = 'infoMessages.featureNotAvailable', text?: string) => {
    return Swal.fire({
        title,
        icon: 'info',
        background: 'var(--alert-popup-bg)',
        color: 'var(--black-text)',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: 'Ok',
    });
}