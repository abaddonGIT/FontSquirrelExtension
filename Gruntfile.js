/**
 * Created by abaddon on 24.11.2014.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        distFolder: 'js/final',
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['js/*.js'],
                dest: '<%= distFolder %>/all.js'
            }
        },
        uglify: {
            my_target: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'js/final/sourcemap.map'
                },
                files: {
                    'js/final/all.min.js': ['js/final/all.js']
                }
            }
        },
        watch: {
            scripts: {
                files: ['js/popup.js', 'js/FontSquirrelStrategy.js', 'js/FontFont2webStrategy.js', 'js/FontEverythingfontsStrategy.js', 'js/FontConverterStrategy.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    interrupt: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build', ['concat', 'uglify', 'watch']);
};