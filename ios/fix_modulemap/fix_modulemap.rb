#!/usr/bin/env ruby

require 'fileutils'

Dir.glob("Pods/Headers/Public/**/ReactCommon.modulemap").each do |file|
  puts "Removing duplicate modulemap: #{file}"
  FileUtils.rm_f(file)
end
