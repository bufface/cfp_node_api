"use strict"

let request = require('supertest-as-promised')
const _ = require('lodash')
const mongoose = require('mongoose')
const config = require('../lib/config')
const api = require('../app')
const host = api

request = request(host)

describe('la ruta de peliculas', function() {
  before(() => {
    mongoose.connect(config.database)
  })

  after((done) => {
    mongoose.disconnect(done)
    mongoose.models = {}
  })

  describe('una peticion a Post', function() {
    it('deberia crear una pelicula', function(done) {
      let movie = {
        'title': 'Back To The Future',
        'year': '1985'
      }
      let user = {
        'username': 'Cristian',
        'password': 'cr1st14n'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          let _user = res.body.user
          _user.password = user.password

          return request
            .post('/auth')
            .set('Accept', 'application/json')
            .send(_user)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let token = res.body.token
          return request
            .post('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send(movie)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let body = res.body

          expect(body).to.have.property('movie')
          movie = body.movie

          expect(movie).to.have.property('title', 'Back To The Future')
          expect(movie).to.have.property('year', '1985')
          expect(movie).to.have.property('_id')

          done()
        })
    })
  })

  describe('GET /', function() {
    it('deberia obtener todas las peliculas', function(done) {
      let movie_id
      let movie2_id
      let token

      let movie = {
        'title': 'Back To The Future',
        'year': '1985'
      }

      let movie2 = {
        'title': 'Back To The Future 2',
        'year': '1989'
      }

      let user = {
        'username': 'Cristian',
        'password': 'cr1st14n'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          let _user = res.body.user
          _user.password = user.password

          return request
            .post('/auth')
            .set('Accept', 'application/json')
            .send(_user)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          token = res.body.token

          return request
            .post('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send(movie)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          movie_id = res.body.movie._id

          return request
            .post('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send(movie2)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          movie2_id = res.body.movie._id

          return request
            .get('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let body = res.body

          expect(body).to.have.property('movies')
          expect(body.movies).to.be.an('array')
            .and.to.have.length.above(2)

          let movies = body.movies
          movie = _.find(movies, {_id: movie_id})
          movie2 = _.find(movies, {_id: movie2_id})

          expect(movie).to.have.property('_id', movie_id)
          expect(movie).to.have.property('title', 'Back To The Future')
          expect(movie).to.have.property('year', '1985')

          expect(movie2).to.have.property('_id', movie2_id)
          expect(movie2).to.have.property('title', 'Back To The Future 2')
          expect(movie2).to.have.property('year', '1989')

          done()
        }, done)
    })
  })

  describe('peticion GET /:id', function() {
    it('deberia una sola pelicula', function(done) {
      let token
      let movie_id
      let movie = {
        'title': 'Her',
        'year': '2013'
      }
      let user = {
        'username': 'Cristian',
        'password': 'cr1st14n'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          let _user = res.body.user
          _user.password = user.password

          return request
            .post('/auth')
            .set('Accept', 'application/json')
            .send(_user)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          token = res.body.token

          return request
            .post('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send(movie)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          movie_id = res.body.movie._id

          return request
            .get('/movie/' + movie_id)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let body = res.body

          expect(body).to.have.property('movie')
          movie = body.movie

          expect(movie).to.have.property('_id', movie_id)
          expect(movie).to.have.property('title', 'Her')
          expect(movie).to.have.property('year', '2013')
          done()
        }, done)
    })
  })

  describe('una peticion PUT: /movie', function() {
    it('debera modificar una pelicula', function(done) {
      let movie_id
      let token
      let movie = {
        'title': 'Pulp Fiction',
        'year': '1993'
      }

      let user = {
        'username': 'Cristian',
        'password': 'cr1st14n'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          let _user = res.body.user
          _user.password = user.password

          return request
            .post('/auth')
            .set('Accept', 'application/json')
            .send(_user)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          token = res.body.token

          return request
            .post('/movie')
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send(movie)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          movie_id = res.body.movie._id
          return request
            .put('/movie/' + movie_id)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .send(movie)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let body = res.body

          expect(body).to.have.property('movie')
          movie = body.movie

          expect(movie).to.have.property('_id', movie_id)
          expect(movie).to.have.property('title', 'Pulp Fiction')
          expect(movie).to.have.property('year', '1993')
          done()
        }, done)
    })
  })

  describe('elimina pelicula DELETE', function() {
    it('debera eliminar una pelicula', function(done) {
      let movie_id
      let token
      let movie = {
        'title': 'Pulp Fiction',
        'year': '1993'
      }
      let user = {
        'username': 'Cristian',
        'password': 'cr1st14n'
      }

      request
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect(201)
        .expect('Content-Type', /application\/json/)
        .then((res) => {
          let _user = res.body.user
          _user.password = user.password

          return request
            .post('/auth')
            .set('Accept', 'application/json')
            .send(_user)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          token = res.body.token

          return request
            .post('/movie')
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .send(movie)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          movie_id = res.body.movie._id
          return request
            .delete('/movie/' + movie_id)
            .set('Accept', 'application/json')
            .set('x-access-token', token)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        })
        .then((res) => {
          let body = res.body

          expect(body).to.be.empty
          done()
        }, done)
    })
  })
})