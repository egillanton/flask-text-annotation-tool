<h1 align="center">
flask-text-annotation-tool
</h1>

<!-- <img src="https://user-images.githubusercontent.com/9976294/70197790-d93a3500-1704-11ea-945d-5102ffe1512e.png" alt="Screenshot" align="center"/> -->

[![Watch the video](https://user-images.githubusercontent.com/9976294/70197790-d93a3500-1704-11ea-945d-5102ffe1512e.png)](https://www.youtube.com/embed/ysWTlpLIFGQ)

## Table of Contents
<!-- ⛔️ MD-MAGIC-EXAMPLE:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

1. [Introduction](#1-introduction)
2. [Setup](#3-setup)
3. [Authors](#4-authors)
4. [License](#5-license)
5. [References](#6-references)

</details>
<!-- ⛔️ MD-MAGIC-EXAMPLE:END -->

## 1 Introduction

## 2 Setup

Make sure to have Python 3.6 or newer, and pip installed.

### Get virtualenv

```bash
$ pip install virtualenv
```

### Create a virtual environment

```bash
Make sure to create a Python3 instead of Python2 environment by referencing its binaries.
$ which python3
/usr/bin/python3
```

You can use any name you want, we will use "venv".
```bash
$ virtualenv -p /usr/bin/python3  venv
```

### Activate environment

```bash
$ . venv/bin/activate
```

Now you have activated your virtual environment and your terminal should display its name as so:
```bash
$(venv)
```

### Install requried packages
```bash
$(venv) pip3 install -r requirements.txt  
```

### Run The Application

```bash
$(venv) flask run
```

You’ll see output similar to this:

```bash
Serving Flask app "app"
Environment: development
Debug mode: on
Running on http://127.0.0.1:5000/
Restarting with stat
Debugger is active!
Debugger PIN: 298-204-950
```

Open the link in your browser.

### Push to Heroku
Make sure you have installed Heroku CLI, and have authentication to the Heroku project.

Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line)
Download and install the Heroku CLI.

If you haven't already, log in to your Heroku account and follow the prompts to create a new SSH public key.
**Login into Heroku**
```bash
$ heroku login
```

**Clone the repository**
Use Git to clone heroku-app's source code to your local machine.


```bash
$ heroku git:clone -a <heroku-app>
$ cd <heroku-app>
```

**Deploy your changes**
Make some changes to the code you just cloned and deploy them to Heroku using Git.

```bash
$ git add .
$ git commit -am "make it better"
$ git push heroku master
```


**Set-Up Google AutoML**
```bash
$ export GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
$ gcloud auth login
$ gcloud config set project ice-atis
$ gcloud auth activate-service-account translate@ice-atis.iam.gserviceaccount.com --key-file=./credentials.json --project=translate
$ gcloud projects add-iam-policy-binding translate --member translate@ice-atis.iam.gserviceaccount.com
```

## License
This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

<p align="center">
🌟 PLEASE STAR THIS REPO IF YOU FOUND SOMETHING INTERESTING 🌟
</p>


https://stackoverflow.com/questions/55176012/google-api-core-exceptions-permissiondenied-403-the-caller-does-not-have-permis

