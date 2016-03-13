# Spam Zero

Spam Zero is a Google Apps Script that helps you to minimise the clutter in your Gmail spam folder. It is a single javacript file that you can use as a skeleton for writing your own advanced Gmail rules & actions.

Gmail is great at filtering spam messages, however sometimes it mistakenly flags a message as spam. Because of this, whenever we see Spam (3) looking at our inbox we always click on it to see if we have any important message hiding within.

To mitigate this issue, we can come up with clever filters to move a message from the Spam folder to the Trash if it matches a certain criteria, but unfortunately Gmail does not provide advanced filtering capabilities so we cannot cover every scenario.

An average spam folder probably looks somewhat similar to mine:

![](http://i.imgur.com/gbbNceO.png)

Looking at this screenshot it's easy to identify a pattern here. Any message that contains my name and has a goomoji is certainly spam  that could moved to the trash without me having to worry about something important being deleted. Sometimes it's not that easy however. The third message from the bottom does not have my name and does not have a goomoji. However it is from a .date email address and it contains a single image attachment. I think knowing only these details would be enough to move it to the trash, but we could go a step further. What we usually find in these emails are the words: "lonely", "relationship", "write me", etc. Wouldn't it be great if we could create such a complex filter that would consider all of these conditions? 

Enter Google Apps Scripts & Spam Zero.

With Google Apps Scripts it is easy to create a javascript file which lives on your Google Drive account, has full access to your Gmail inbox and is periodically executed by Google on their servers. Spam Zero will help you quickly get you up to speed creating your own rules and actions.

## Installation

Open up https://www.google.com/script/start/, click Start Scripting. Once you are logged in to your Google account, you will be presented with the script editor. Remove the default generated function and paste the contents of spam-zero.js into the editor. Most of the code is annotated plus there are sample rules to get you started.

## Usage

Edit the `actions` array and define what actions you want to take when a rule matches your message:

```javascript
var actions = ["READ", "MOVE_TO_TRASH"];
```

Currently the following actions are implemented:

```
READ -> Mark a message as read
MOVE_TO_TRASH -> Move the message to trash
LABEL(name) -> Give it a label with a name
```

It should be quite straightforward to add your own actions.

Add your own custom rules to the `rules` array:

```javascript
var rules = [
  /**
  * @param {GmailMessage}
  * @param {Object}
  *
  * @return {Boolean}
  */
  function(m, raw) {
    "Goomoji + name in subject"
    return StringHelper.containsGoomoji(raw.headers.subject) && raw.headers.subject.match(/john.doe/i);
  }
];
```

Until you get familiar with how things work I would recommend you changing the number of threads you operate on:

```javascript
var threads = GmailApp.getSpamThreads(0, 1);
```

Now instead of working on all spam messages you will only get the last one (`GmailApp.getSpamThreads(start, max)`).

To debug your script click on the line number in the gutter, it will create a breakpoint. Now click on the little bug icon and wait for your breakpoint to pause the script. There are buttons next to it that lets you step over / into your calls.

The first time you execute the script it will ask you for giving it permissions to your account. One of the best things about this approach (using your own scripts) is that you don't need to give access to a random third party to your precious contains-everything-about-your-whole-life Gmail account.

For more information take a look at the source code.

## Scheduled execution

As this script is executed on server side, you will need to tell it to trigger certain times of the day. Click on the clock icon in the toolbar and select an execution strategy. Start with running it once an hour and see how it goes.

## Motivation

The motivation behind creating this script was to help me clean up my spam folder, however you could use it for any other purpose. If you want to operate on different messages just change the first line from 

```javascript
var threads = GmailApp.getSpamThreads();
```

to something different, for example 

```javascript
var threads = GmailApp.search('is:starred subject:"IMPORTANT"');
```

## Further ideas

It is quite easy to use the Google Drive API alongside the Gmail one in this script, so you could create your own logger that audits everything your script does to your messages in a Spreadsheet.

## More information

More details on how to use the GmailApp API provided by Google take a look at the documentation: https://developers.google.com/apps-script/reference/gmail/
