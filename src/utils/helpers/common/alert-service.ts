import Swal, { SweetAlertPosition } from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css";

import { errorMessages } from "../enums/messages.enum"

const getAlertBg = () => {
    return document.documentElement.classList.contains("dark") ? "#1E293B" : "#FFFFFF";
};

export const successToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text,
        icon: 'success',
        background: getAlertBg(),
        color: 'var(--foreground)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    })
}

export const warningToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text,
        icon: 'warning',
        background: getAlertBg(),
        color: 'var(--foreground)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    })
}

export const errorToaster = (text: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        text: text ?? errorMessages.somethingWentWrong,
        icon: 'error',
        background: getAlertBg(),
        color: 'var(--foreground)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        position,
        timer: 3000,
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    })
}

export const errorToasterAutoClose = (title: string, position: SweetAlertPosition = 'top-right') => {
    Swal.fire({
        title,
        icon: 'error',
        background: getAlertBg(),
        color: 'var(--foreground)',
        confirmButtonColor: 'var(--primary)',
        showConfirmButton: false,
        toast: true,
        timerProgressBar: true,
        timer: 5000,
        position,
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    })
}

export const confirmationPopup = async (title: string = 'warningMessages.confirmationDefaultMsg', text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'question',
        background: getAlertBg(),
        color: 'var(--foreground)',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--secondary)',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    });
}

export const priorDownloadConfirmationPopup = async (title: string = 'Are you sure you want to download?', text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'question',
        background: getAlertBg(),
        color: 'var(--foreground)',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--secondary)',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    });
}

export const customConfirmationPopup = async (title: string, confirmButtonText: string, cancelButtonText: string) => {
    return Swal.fire({
        title,
        icon: 'question',
        background: getAlertBg(),
        color: 'var(--foreground)',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--secondary)',
        confirmButtonText,
        cancelButtonText,
        allowOutsideClick: false,
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    });
}

export const infoPopup = async (title: string = 'infoMessages.featureNotAvailable', text?: string) => {
    return Swal.fire({
        title,
        text,
        icon: 'info',
        background: getAlertBg(),
        color: 'var(--foreground)',
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: 'Ok',
        customClass: {
            popup: 'border border-border-main shadow-lg'
        }
    });
}