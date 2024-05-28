import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function invalidPasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!validPassword(control.value)) {
    return { invalidPassword: { value: control.value } };
  }
  return null;
}

export function validPassword(password: string) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{10,}$/;
  return passwordRegex.test(password);
}

export function unmatchingPasswordValidator(
  fieldA: string,
  fieldB: string
): ValidatorFn {
  return (account: AbstractControl): ValidationErrors | null => {
    let pass = account.get(fieldA)?.value;
    let confirmPass = account.get(fieldB)?.value;
    return pass === confirmPass ? null : { notSame: true };
  };
}

export function validateURL(url: string) {
  const urlRE =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  return urlRE.test(url);
}

export function urlValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!validateURL(control.value)) {
    return { invalidRepository: { value: control.value } };
  }
  return null;
}

export function semverValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  return semverRegex.test(control.value) ? null : { invalidSemver: true };
}

const semverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
