import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  let cloned = req;

  if (token) {
    cloned = cloned.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (username) {
    cloned = cloned.clone({
      setHeaders: {
        'X-Username': username
      }
    });
  }

  return next(cloned);
};
