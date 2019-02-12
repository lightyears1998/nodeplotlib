import opn from 'opn';
import request from 'request';
import { Server } from '../src/server';
jest.mock('opn');

describe('Server', () => {
  let server: any;

  beforeEach(() => {
    server = new Server(8080);
  });

  it('should instantiate', () => {
    expect(server).toBeTruthy();
  });

  it('should call opn once when spawning a plot', () => {
    server.spawn({0: {
      opened: false,
      pending: false,
      plots: []
    }});

    expect(opn).toHaveBeenCalledTimes(1);
  });

  it('should serve the data', (done) => {
    server.spawn({0: {
      opened: false,
      pending: false,
      plots: [{data: [{ x: [1], y: [2]}]}]
    }});

    request(`http://localhost:8080/data/0`, (err, response, body) => {
      expect(JSON.parse(body)).toEqual([{data: [{ x: [1], y: [2]}]}]);
      done();
    });
  });

  it('should spawn two times but listen just once', (done) => {
    const data = {0: {
      opened: false,
      pending: false,
      plots: [{data: [{ x: [1], y: [2]}]}]
    }};

    server.spawn(data);
    server.spawn(data);

    request(`http://localhost:8080/data/0`, (err, response, body) => {
      expect(JSON.parse(body)).toEqual([{data: [{ x: [1], y: [2]}]}]);
      done();
    });
  });

  it('should return 404 if routes not matching', (done) => {
    const data = {0: {
      opened: false,
      pending: false,
      plots: [{data: [{ x: [1], y: [2]}]}]
    }};

    server.spawn(data);

    request(`http://localhost:8080/fdsaffds`, (err, response, body) => {
      expect(response.statusCode).toBe(404);
      expect(response.body).toBe('Server address not found');
      done();
    });
  });

  it('should work with callback', () => {
    const mock = jest.fn().mockImplementation(() => null);

    server.spawn({}, mock);

    expect(mock).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    server.clean();
    server = null;
  });
});