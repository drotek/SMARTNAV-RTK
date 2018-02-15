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
var appPackage  = require( './package.json');

var gulp  = require('gulp');
var yargs  = require('yargs');
var connect  = require('gulp-connect');

var watchify  = require('watchify');
var del  = require('del');
var browserify  = require('browserify');
var util = require('util');
//var assign  = require('lodash').assign;
var stringify  = require('stringify');
var envify  = require('envify/custom');
var uglify = require('gulp-uglify');
var gutil  = require('gulp-util');
var source  = require('vinyl-source-stream');
var buffer  = require('vinyl-buffer');
var plumber  = require('gulp-plumber');
var less  = require('gulp-less');
var lessglobplugin  = require('less-plugin-glob');
var concat  = require('gulp-concat');
var gulpif  = require('gulp-if');
var autoprefixer  = require('gulp-autoprefixer');
var gulpFilter  = require('gulp-filter');
var svgmin  = require('gulp-svgmin');
var watch  = require('gulp-watch');
//var typescript  = require('gulp-typescript');
var streamify = require('gulp-streamify');
var compression = require('compression');

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
  app: gulp.paths.dist + '/app/index.js',
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

var opts = Object.assign({}, watchify.args);opts = Object.assign(opts, customOpts);

/**
 * Tasks
 */

 gulp.task('browserify',['typescript','copy:index','copy:html','copy:chartjs','copy:toastr'], function() {
    var bundler = browserify(opts);
   
    bundler.transform(stringify(gulp.stringifyFileTypes || ['.html']));
    bundler.transform(envify(gulp.environmentVariables || {NODE_ENV_TARGET: !!yargs.argv.production ? 'production' : 'development'}), {global:true});
   
    return bundler.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulpif(!!yargs.argv.production, streamify(uglify({
            mangle:false,
            sourceMap:null,
        }))))
        .pipe(gulp.dest(gulp.paths.dist))
        .pipe(connect.reload())
});

 
gulp.task('typescript', function () {
    var typescript  = require('gulp-typescript');
    let tsProject = typescript.createProject("tsconfig.json");
    return  gulp.src('src/app/**/*.ts')
    .pipe(typescript(tsProject))
    .js
    .pipe(gulp.dest('dist/app'));
});

gulp.task('clean:js', function (done) {
    return del([gulp.paths.dist + '/*.js'], done);
});

gulp.task('clean:css', function (done) {
    return del([gulp.paths.dist + '/*.css'], done);
});

gulp.task('clean:images', function (done) {
    return del([gulp.paths.dist + '/assets/images'], done);
});

gulp.task('clean:fonts', function (done) {
    return del([gulp.paths.dist + '/assets/fonts'], done);
});

gulp.task('clean', function (done) {
    return del([gulp.paths.dist + '/**/*'], { force: true }, function (err, paths) {
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

    return gulp.src([gulp.paths.assets + '/images/**/*'], {base: gulp.paths.src + '/'})
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
    return gulp.src([gulp.paths.assets + '/fonts/**/*'], {base: gulp.paths.src + '/'})
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task("copy:html", function(){
      return gulp.src([gulp.paths.src + '/**/*.html'],{base: gulp.paths.src + '/'})
         .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:index', function () {
    return gulp.src([gulp.paths.src + '/index.html'])
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:chartjs', function () {
    return gulp.src([gulp.paths.externalLib + '/Chart.min.js'])
        .pipe(gulp.dest(gulp.paths.dist));
});

gulp.task('copy:toastr', function () {
    return gulp.src([
        gulp.paths.node_modules + '/angular-toastr/dist/angular-toastr.min.js',
        gulp.paths.node_modules + '/angular-toastr/dist/angular-toastr.tpls.min.js',
        gulp.paths.node_modules + '/angular-toastr/dist/angular-toastr.min.css',
        ])
        .pipe(gulp.dest(gulp.paths.dist));
});


gulp.task('copy', ['copy:images', 'copy:fonts','copy:html', 'copy:index', 'copy:chartjs','copy:toastr']);

gulp.task('watch', function () {
    watch([gulp.paths.assets + '/**/*.less', gulp.paths.src + '/app/**/*.less'], function() {
        gulp.start('style');
    });
    watch([gulp.paths.src + '/app/**/*.ts'], function() {
        gulp.start('typescript','browserify');
    });
    watch([gulp.paths.assets + '/images/*'], function() {
        gulp.start('copy:images');
    });
    watch([gulp.paths.assets + '/fonts/*'], function() {
        gulp.start('copy:fonts');
    });
    watch([gulp.files.index], function() {
        gulp.start('copy:index','browserify');
    });
});

gulp.task('default', ['build']);

gulp.task('build', ['clean'],function(){
	return gulp.start('typescript','browserify', 'style', 'copy');
});

gulp.task('connect', function() {
  connect.server({
    root: [gulp.paths.dist],
    livereload: true,
    port: gulp.applicationServerPort || 8080,
    host: '0.0.0.0',
    middleware: function () {
        return [
            compression({
                level:1,
                memLevel:1,
            })
        ];
    }
  });
});


gulp.task('serve', ['connect','typescript', 'browserify', 'style', 'copy', 'watch']);

gulp.task('build_and_serve', ['build','connect']);