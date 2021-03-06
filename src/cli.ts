#!/usr/bin/env node
/* eslint-disable no-console */

import * as nopt from 'nopt'

import { defaultOptions } from './default-options'
import { Options } from './types'
import { vdx } from './vdx'

const packageJsonVersion = require('../package.json').version

const usageMessage = `
Usage: vdx <pattern> [options]

Pattern:
  Globs of input files to process.

Options:
  -c,  --crop [<x>,<y>,]<width>,<height>  Crop the video to the specified
                                          dimension. <x> and <y> both default
                                          to 0.
  -d,  --debug  Print the underlying FFmpeg command that is being run.
  -f,  --format <format>  Convert to a different file format.
       --gif  Shorthand for '--format gif'.
       --mov  Shorthand for '--format mov'.
       --mp4  Shorthand for '--format mp4'.
  -fp, --fps <fps>  Change the frame rate.
  -h,  --help  Print this message.
  -na, --no-audio  Strip the audio.
  -o,  --output <directory>  Set the output directory. <directory> defaults
                             to './build'.
  -p,  --parallel <concurrency>  Set the maximum number of files to process
                                 concurrently. <concurrency> defaults to 3.
  -r,  --resize <width>,<height>  Resize the video. Set either <width> or
                                  <height> to -1 to maintain the aspect ratio.
  -rv, --reverse  Reverse the video.
  -ro, --rotate <angle>  Rotate the video. <angle> must be one of -90, 90,
                         or 180.
  -s,  --speed <speed>  Change the speed. To slow down, set <speed> to a
                        number between 0 and 1. To speed up, set <speed> to a
                        number greater than 1.
  -t,  --trim <start>[,<end>]  Trim to the specified duration. Omit <end> to
                               trim from <start> to the end of the input file.
  -v,  --version  Print the version number.
  -vo, --volume <volume>  Change the volume. To decrease the volume, set
                          <volume> to a number between 0 and 1. To increase the
                          volume, set <speed> to a number greater than 1.

Examples:
  $ vdx '*.mov' --crop=360,640    # Crop to width 360, height 640
  $ vdx '*.mov' --format=gif      # Convert to GIF
  $ vdx '*.mov' --fps=12          # Change the frame rate to 12
  $ vdx '*.mov' --no-audio        # Strip audio
  $ vdx '*.mov' --resize=360,-1   # Resize to width 360, maintaining aspect ratio
  $ vdx '*.mov' --reverse         # Reverse
  $ vdx '*.mov' --rotate=90       # Rotate 90 degrees clockwise
  $ vdx '*.mov' --speed=2         # Double the speed
  $ vdx '*.mov' --trim=0:05,0:10  # Trim from time 0:05 to 0:10
  $ vdx '*.mov' --volume=0.5      # Halve the volume
`

const knownOptions = {
  audio: Boolean,
  crop: String,
  debug: Boolean,
  format: String,
  fps: Number,
  help: Boolean,
  output: String,
  parallel: Number,
  resize: String,
  reverse: Boolean,
  rotate: ['-90', '90', '180'],
  speed: Number,
  trim: String,
  version: Boolean,
  volume: Number
}

const shorthands = {
  a: '--audio',
  c: '--crop',
  cut: '--trim',
  d: '--debug',
  f: '--format',
  gif: '--format gif',
  h: '--help',
  mov: '--format mov',
  mp4: '--format mp4',
  na: '--no-audio',
  o: '--output',
  p: '--parallel',
  r: '--resize',
  ro: '--rotate',
  rv: '--reverse',
  s: '--speed',
  scale: '--resize',
  t: '--trim',
  v: '--version',
  vo: '--volume',
  x: '--fps'
}

async function main() {
  const { argv, debug, help, output, parallel, version, ...rest } = nopt(
    knownOptions,
    shorthands
  )
  if (help) {
    console.log(usageMessage)
    process.exit(0)
  }
  if (version) {
    console.log(packageJsonVersion)
    process.exit(0)
  }
  const globPatterns = argv.remain
  if (globPatterns.length === 0) {
    console.error(`vdx: Need a glob pattern for input files`)
    process.exit(1)
  }
  const outputDirectory = typeof output === 'undefined' ? './build' : output
  const concurrency = typeof parallel === 'undefined' ? 3 : parallel
  const options = { ...defaultOptions, ...rest } as Options
  try {
    await vdx(globPatterns, outputDirectory, options, concurrency, debug)
  } catch (error) {
    console.error(`vdx: ${error.message}`)
    process.exit(1)
  }
}

main()
