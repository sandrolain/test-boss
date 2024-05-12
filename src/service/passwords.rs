use zxcvbn::zxcvbn;

pub fn valid_password(password: &str) -> bool {
  if password.len() < 8 {
    return false;
  }
  match zxcvbn(password, &[]) {
    Ok(estimate) => {
      estimate.score() >= 3
    },
    Err(_) => {
      false
    }
  }
}
