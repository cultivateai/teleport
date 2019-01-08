/*
Copyright 2015 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import history from 'app/services/history';
import { createMemoryHistory } from 'history';
import cfg from 'app/config';

history.init( new createMemoryHistory());

describe('services/history', () => {

  const fallbackRoute = cfg.routes.app;
  const browserHistory = history.original(/* be default returns inMemory history*/);

  beforeEach(() => {
    jest.spyOn(browserHistory, 'push');
    jest.spyOn(history, 'getRoutes');
    jest.spyOn(history, '_pageRefresh').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canPush', () => {
    const push = actual => ({
      andExpect(expected){
        history.push(actual)
        expect(browserHistory.push).toHaveBeenCalledWith(expected);
      }
    })

    it('should push if allowed else fallback to default route', () => {
      history.getRoutes.mockReturnValue(['/valid', '/']);
      push('invalid').andExpect(fallbackRoute);
      push('.').andExpect(fallbackRoute);
      push('/valid/test').andExpect(fallbackRoute);
      push('@#4').andExpect(fallbackRoute);
      push('/valid').andExpect('/valid');
      push('').andExpect('');
      push('/').andExpect('/');
    })

    it('should refresh a page if called withRefresh=true', () => {
      let route = '/';
      history.getRoutes.mockReturnValue([route]);
      history.push(route, true)
      expect(history._pageRefresh).toBeCalledWith(route);
    })
  })

  describe('goToLogin()', () => {
    it('should navigate to login with URL that has redirect parameter with current location', () => {
      history.getRoutes.mockReturnValue(['/web/login', '/current-location']);
      history.original().location.pathname = '/current-location'
      history.goToLogin(true);

      const expected = '/web/login?redirect_uri=http://localhost/current-location';
      expect(history._pageRefresh).toBeCalledWith(expected);
    });
  });
})