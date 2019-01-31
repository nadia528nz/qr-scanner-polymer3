/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 *
 * Based on this tutorial https://blog.prototypr.io/make-a-camera-web-app-tutorial-part-1-ec284af8dddf
 * @author Nadia Zhu
 *
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
import '/node_modules/jsqr/dist/jsQR.js';
import './shared-styles.js';

class MyView1 extends PolymerElement {
    static get properties () {
        return {
            test: {
                type: String,
                value: ''
            },
            cameraView: {
                type: Object
            },
            cameraView: {
                type: Object
            },
            cameraView: {
                type: Object
            },
            code: {
                type: Object
            },
            _takePhotoTimeoutId: {
                type: Number,
                value: 0
            },
            scanStopped: {
                type: Boolean,
                value: false
            },
            _frequency: {
                type: Number,
                value: 10
            }
        };
    }

    constructor() {
        // If you override the constructor, always call the
        // superconstructor first.
        super();
        // Resolve warning about scroll performance
        // See https://developers.google.com/web/updates/2016/06/passive-event-listeners
        setPassiveTouchGestures(true);
    }

    ready(){
        // If you override ready, always call super.ready() first.
        super.ready();

        this.cameraView = this.$.camera_view,
        this.cameraOutput = this.$.camera_output,
        this.cameraSensor = this.$.camera_sensor,
        this.cameraTrigger = this.$.camera_trigger;
        this.cameraStart();
    }

    cameraStart() {
        var constraints = { video: { facingMode: "environment" }, audio: false };
        var thisRef = this;
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function(stream) {
            var track = stream.getTracks()[0];
            thisRef.cameraView.srcObject = stream;
            thisRef._startCapture();
        })
        .catch(function(error) {
            console.error("Oops. Something is broken.", error);
        });
    }

    takePhoto() {
        if (this.cameraView.videoWidth != undefined && this.cameraView.videoWidth > 0 &&
            this.cameraView.videoHeight != undefined && this.cameraView.videoHeight > 0) {
            this.cameraSensor.width = this.cameraView.videoWidth;
            this.cameraSensor.height = this.cameraView.videoHeight;
            var ctx = this.cameraSensor.getContext("2d");
            ctx.drawImage(this.cameraView, 0, 0);
            this.cameraOutput.src = this.cameraSensor.toDataURL("image/webp");
            this.cameraOutput.classList.add("taken");


            var imageData = ctx.getImageData(0, 0, this.cameraSensor.width * 2, this.cameraSensor.height * 2);
            //console.log(imageData);
            this.code = jsQR(imageData.data, this.cameraSensor.width * 2, this.cameraSensor.height * 2);
            if (this.code) {
                this._stopCapture();
                console.log("Found QR code", this.code);
            }
            else {
                console.log("QR code NOT found");
            }
        }
    }

    _startCaptureByButton() {
        console.log('_startCaptureByButton');
        this.scanStopped = false;
        this._startCapture();
    }

    _startCapture() {
        console.log('_startCapture', this.scanStopped);
        if (!this.scanStopped) {
            clearTimeout(this._takePhotoTimeoutId);
            this._takePhotoTimeoutId = 0;
            this._doCapture();
        }
    }

    _stopCapture() {
        clearTimeout(this._takePhotoTimeoutId);
        this._takePhotoTimeoutId = undefined;
        this.scanStopped = true;
        console.log('_stopCapture', this._takePhotoTimeoutId);
    }

    _doCapture() {
        console.log('_doCapture', this._takePhotoTimeoutId, this.scanStopped);
        if (this._takePhotoTimeoutId != undefined && !this.scanStopped) {
            this.takePhoto();
            clearTimeout(this._takePhotoTimeoutId);
            this._takePhotoTimeoutId = setTimeout(() => {
                this._doCapture();
            }, 34);
        }
        else {
            console.log('force stop it!');
            this._stopCapture();
        }

    }



  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }

        #camera, #camera_view, #camera_sensor, #camera_output{
            height: 100%;
            width: 100%;
            object-fit: cover;
        }

        #camera_trigger{
            width: 200px;
            background-color: black;
            color: white;
            font-size: 16px;
            border-radius: 30px;
            border: none;
            padding: 15px 20px;
            text-align: center;
            box-shadow: 0 5px 10px 0 rgba(0,0,0,0.2);
            position: fixed;
            bottom: 30px;
            left: calc(50% - 100px);
            display: none;
        }

        .taken{
            height: 100px!important;
            width: 100px!important;
            transition: all 0.5s ease-in;
            border: solid 3px white;
            box-shadow: 0 5px 10px 0 rgba(0,0,0,0.2);
            top: 20px;
            right: 20px;
            z-index: 2;
        }

        #camera_sensor {
            display: none;
        }

        .card {
            min-height: 800px;
        }

        #start_button, #stop_button{
            width: 200px;
            background-color: black;
            color: white;
            font-size: 16px;
            border-radius: 30px;
            border: none;
            padding: 15px 20px;
            text-align: center;
            box-shadow: 0 5px 10px 0 rgba(0,0,0,0.2);
        }

        #buttons {
            display: inline-flex;
            position: sticky;
            bottom: 30px;
            width: 100%;
        }
      </style>

      <div class="card">
        <div class="circle">1</div>
        <h1>QR TEST</h1>
        <p>A TEST</p>
        <!-- Camera -->
        <main id="camera">

            <!-- Camera view -->
            <video id="camera_view" autoplay playsinline></video>
            <!-- Camera sensor -->
            <canvas id="camera_sensor"></canvas>
            <!-- Camera output -->
            <img src="//:0" alt="" id="camera_output">
            <span>QR code is: {{code.data}}</span>
            <span>Scan stopped: {{scanStopped}}</span>

            <!-- Camera trigger -->
            <button id="camera_trigger" on-click="takePhoto">Take a picture</button>

            <div id="buttons">
                <button id="start_button" on-click="_startCaptureByButton">Start Scan</button>
                <button id="stop_button" on-click="_stopCapture">Stop Scan</button>
            <div>

        </main>
      </div>
    `;
  }
}

window.customElements.define('my-view1', MyView1);
