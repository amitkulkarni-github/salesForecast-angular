import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  handleError(error) {
      console.log(error)
    // your custom error handling logic    
  }
}