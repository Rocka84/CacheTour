module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint:{
			options: {
				node:true
			},
			src: ["source/*.js"],
			grunt: ["Gruntfile.js"]
		},
		concat: {
			options: {
				banner: grunt.file.read("templates/header.js.tpl"),
			},
			dist: {
				src: ["source/main.js"],
				dest: "dist/<%= pkg.name %>.user.js"
			}
		},
		watch: {
			options: {
				nospawn: true
			},
			src: {
				files: ["source/*.js"],
				tasks: ["jshint:src"]
			},
			grunt: {
				files: ["Gruntfile.js"],
				tasks: ["jshint:grunt"]
			}
		}
	});

	function createFromTemplateFile(target_file, template_file) {
		grunt.file.write(target_file, grunt.template.process(grunt.file.read(template_file)));
	}
	grunt.task.registerTask("create_version_file",function() {
		createFromTemplateFile("dist/" + grunt.config.data.pkg.name + ".version.js", "templates/version.js.tpl");
		return true;
	});

	grunt.task.registerTask("dist", ["create_version_file", "jshint:src", "concat:dist"]);

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["watch"]);

};

