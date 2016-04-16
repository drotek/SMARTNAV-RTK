/*
 * RTKLIB WEB CONSOLE code is placed under the GPL license.
 * Written by Frederic BECQUIER (frederic.becquier@openiteam.fr)
 * Copyright (c) 2016, DROTEK SAS
 * All rights reserved.

 * If you are interested in using RTKLIB WEB CONSOLE code as a part of a
 * closed source project, please contact DROTEK SAS (contact@drotek.com).

 * This file is part of RTKLIB WEB CONSOLE.

 * RTKLIB WEB CONSOLE is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * RTKLIB WEB CONSOLE is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with RTKLIB WEB CONSOLE. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

/**
 *
 * Principal Gulp Script.
 *
 */


/**
 * Imports.
 */
var appPackage = require('./package.json');

var gulp = require('gulp');
var yargs = require('yargs');
var connect = require('gulp-connect');

//gulp.connect = connect;

var watchify = require('watchify');
var del = require('del');
var browserify = require('browserify');
var assign = require('lodash').assign;
var stringify = require('stringify');
var envify = require('envify/custom');
var ngannotate = require('browserify-ngannotate');
var minifyify = require('minifyify');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var lessglobplugin = require('less-plugin-glob');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');
var autoprefixer = require('gulp-autoprefixer');
var gulpFilter = require('gulp-filter');
var svgmin = require('gulp-svgmin');
var watch = require('gulp-watch');
var minifyCSS = require('gulp-cssnano');

/**
 * Gulp Tasks config parameters.
 */

//Path
gulp.paths = {
  src: './src',
  dist: './dist',
  node_modules: './node_modules',
  assets: './src/assets',
  externalLib : './src/app/shared/components/externalLib'    
};

//Files
gulp.files = {
  app: gulp.paths.src + '/index.js',
  less: gulp.paths.src + '/assets/styles/themes/**/main.less',
  index: gulp.paths.src + '/index.html'
};

//Application's name
gulp.applicationName = appPackage.name;

//Server port
gulp.serverPort = 8080;

gulp.environmentVariables = {
     NODE_ENV_TARGET: !!yargs.argv.production ? 'production' : 'development'
};

var x;

var customOpts = {
    entries: [gulp.files.app],
    debug: true
};

var opts = assign({}, watchify.args, customOpts);

/*
 * Functions.
 */

function initTransforms() {
    x.transform(stringify(gulp.stringifyFileTypes || ['.html']));
    x.transform(envify(gulp.environmentVariables || {NODE_ENV_TARGET: !!yargs.argv.production ? 'production' : 'development'}), {global:true});
    x.transform(ngannotate);

    x.plugin(minifyify, {
        map: false,
        output: gulp.paths.dist + '/bundle.map.js',
        uglify: !!yargs.argv.production,
        minify: !!yargs.argv.production,
        global: true
    });
}

function bundle() {
    return x.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest(gulp.paths.dist))
        .pipe(connect.reload());
}

/**
 * Tasks
 */

gulp.task('browserify:watch', function() {
    x = watchify(browserify(opts));
    initTransforms();
    x.on('update', bundle);
    x.on('log', gutil.log);
    return bundle();
});

gulp.task('clean:js', function (done) {
    del([gulp.paths.dist + '/*.js'], done);
});

gulp.task('clean:css', function (done) {
    del([gulp.paths.dist + '/*.css'], done);
});

gulp.task('clean:images', function (done) {
    del([gulp.paths.dist + '/assets/images'], done);
});

gulp.task('clean:fonts', function (done) {
    del([gulp.paths.dist + '/assets/fonts'], done);
});

gulp.task('clean', function (done) {
    del([gulp.paths.dist + '/**/*'], { force: true }, function (err, paths) {
        console.log('Erreur lors du clean', err, paths);
        done();
    });
});

gulp.task('style', ['clean:css', 'style:css']);

gulp.task('style:css', function () {
    return gulp.src(gulp.files.less)
        .pipe(plumber())
        .pipe(less({
            plugins: [lessglobplugin]
        }))
        .pipe(concat('main.css'))
        .pipe(autoprefixer())
        .pipe(gulp.dest(gulp.paths.dist))
        .pipe(connect.reload());
});



gulp.task('copy:images', function () {

    var svgFilter = gulpFilter('**/*.svg', {restore: true});

    gulp.src([gulp.paths.assets + '/images/**/*'], {base: gulp.paths.src + '/'})
        .pipe(svgFilter)
        .pipe(svgmin({
            js2svg: {
                pretty: true
            },
            plugins: [{
                cleanupAttrs: true
            }, {
                removeDoctype: true
            }, {
                removeXMLProcInst: true
            }, {
                removeComments: true
            }, {
                removeMetaData: true
            }, {
                removeTitle: true
            }, {
                removeDesc: true
            }, {
                removeUselessDefs: true
            }, {
                removeEditorsNSData: true
            }, {
                removeEmptyAttrs: true
            }, {
                removeHiddenElems: false
            }, {
                removeEmptyText: true
            }, {
                removeEmptyContainers: true
            }, {
                removeViewBox: true
            }, {
                cleanUpEnableBackground: true
            }, {
                convertTyleToAttrs: true
            }, {
                convertColors: true
            }, {
                convertPathData: false
            }, {
                convertTransform: false
            }, {
                removeUnknownsAndDefaults: false
            }, {
                removeNonInheritableGroupAttrs: false
            }, {
                removeUselessStrokeAndFill: true
            }, {
                removeUnusedNS: true
            }, {
                cleanupIDs: false
            }, {
                cleanupNumericValues: {
                    floatPrecision: 3
                }
            }, {
                moveElemsAttrsToGroup: false
            }, {
                moveGroupAttrsToElems: false
            }, {
                collapseGroups: false
            }, {
                removeRasterImages: false
            }, {
                mergePaths: false
            }, {
                convertShapeToPath: false
            }, {
                sortAttrs: false
            }, {
                transformsWithOnePath: false
            }]
        }))
        .pipe(svgFilter.restore)
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:fonts', function () {
    gulp.src([gulp.paths.assets + '/fonts/**/*'], {base: gulp.paths.src + '/'})
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:index', function () {
    gulp.src([gulp.paths.src + '/index.html'])
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:chartjs', function () {
    gulp.src([gulp.paths.externalLib + '/Chart.min.js'])
        .pipe(gulp.dest(gulp.paths.dist));
});


gulp.task('copy', ['copy:images', 'copy:fonts', 'copy:index', 'copy:chartjs']);

gulp.task('watch', function () {
    watch([gulp.paths.assets + '/**/*.less', gulp.paths.src + '/app/**/*.less'], function() {
        gulp.start('style');
    });
    watch([gulp.paths.assets + '/images/*'], function() {
        gulp.start('copy:images');
    });
    watch([gulp.paths.assets + '/fonts/*'], function() {
        gulp.start('copy:fonts');
    });
    watch([gulp.files.index], function() {
        gulp.start('copy:index');
    });
});

gulp.task('default', ['build']);

gulp.task('build', ['clean','browserify:watch', 'style', 'copy']);

gulp.task('connect', function() {
  connect.server({
    root: [gulp.paths.dist],
    livereload: true,
    port: gulp.applicationServerPort || 8080,
    host: '0.0.0.0'
  });
});


gulp.task('serve', ['connect', 'browserify:watch', 'style', 'copy', 'watch']);