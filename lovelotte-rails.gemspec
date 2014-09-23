# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'lovelotte/rails/version'

Gem::Specification.new do |spec|
  spec.name          = "lovelotte-rails"
  spec.version       = Lovelotte::Rails::VERSION
  spec.authors       = ["Seliverstov Maxim"]
  spec.email         = ["maxim.web.developer@gmail.com"]
  spec.summary       = %q{Gem wrapper for lovelotte jquery plugins}
  spec.description   = %q{Gem wrapper for lovelotte jquery plugins}
  spec.homepage      = "https://github.com/seliverstov-maxim/lovelotte-rails"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.files         = Dir['{lib,vendor}/**/*']
  spec.require_paths = ['lib']

  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "rake"
  spec.add_dependency 'jquery-rails'

  spec.add_runtime_dependency 'rails', '>= 3.0'
end
