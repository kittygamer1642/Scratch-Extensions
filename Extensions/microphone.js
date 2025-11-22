(function(Scratch) {
  'use strict';
  
  class Microphone {
    constructor() {
      this.frequency = 0; //variable to store frequency
      this.mic = false; //variable to store mic status
    }
    getInfo() {
      return {
        id: 'microphone',
        name: 'Microphone',
        blocks: [
          {
            opcode: 'micEnabled',
            text: 'mic enabled?',
            blockType: Scratch.BlockType.BOOLEAN
          },
          {
            opcode: 'sampleMic',
            text: 'mic frequency',
            blockType: Scratch.BlockType.REPORTER
          },
          {
            opcode: 'frequencyAsNote',
            text: 'frequency [Hz] as note',
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              Hz: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 261.63 //middle C is 261.63Hz
              }
            }
          }
        ]
      };
    }
    
    micEnabled() {
      return this.mic; //return microphone status
    }
    sampleMic() {
      if (this.mic) {
        return this.frequency; //return the last frequency detected by microphone
      } else {
        return ''; //return nothing if the microphone is disabled
      }
    }
    frequencyAsNote(args) {
      //convert frequency to note number for the scratch music extension
      let note = Math.round(12 * Math.log2(args.Hz / 440) + 69);
      return note;
    }

    startListening() {
      //Check for browser compatibility
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //Access the microphone
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 2048;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const getFrequency = () => {
              analyser.getByteFrequencyData(dataArray);
              const maxIndex = dataArray.indexOf(Math.max(...dataArray));
              this.frequency = maxIndex * (audioContext.sampleRate / analyser.fftSize); // Update class property
              console.log(`Detected Frequency: ${this.frequency.toFixed(2)} Hz`);
              requestAnimationFrame(getFrequency);
            };

            getFrequency(); //Start the frequency detection
            this.mic = true; //set microphone status to true if the getFrequency function runs without errors
          })
          .catch((err) => {
            console.error('Error accessing the microphone: ', err);
            this.mic = false; //set microphone status to false if the microphone cannot be accessed
          });
      } else {
        console.error('getUserMedia not supported in this browser.');
        this.mic = false; //set microphone status to false if the browser does not support it
      }
    }
  }

  const microphone = new Microphone(); //create an extension object
  microphone.startListening(); //Start listening for audio
  Scratch.extensions.register(microphone); //add extension to project
})(Scratch);
