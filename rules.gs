/**
 * Your custom rules that are going to be tested against your messages.
 *
 * Each item in the rules array should be a function that takes two parameters.
 *
 * The first parameter is a GmailMessage, the second is an Object which contains the message's raw content.
 *
 * It has the following structure:
 *
 * {
 *   headers: {
 *     "from": "From <from@address.com>"
 *     "to": "to@address.com",
 *     "subject: "Subject"
 *     "received": "from some.domain.com ([42.42.42.42]) by mx.google.com...",
 *     "content-type: "text/html; charset=UTF-8",
 *     // etc. all other headers are available here that you can see opening up "Show original"
 *   }
 *
 *   body: {
 *     "<html><body>The body of the message</body></html>"
 *   }
 * }
 *
 * Return true from your function if you want your selected action(s) to be run on the entire thread.
 *
 * You can also add a one line description that will show up in the logs (provided isDebug is true, see below).
 *
 * Make sure the description is on the first line between double quotes. No need for trailing semicolons.
 *
 * Sample rules are provided below.
 *
 * @type {Function[]}
 */
// Use these helper methods in your rules
var MessageHelper = {
    /**
     * @param {GmailMessage} message
     *
     * @return {Boolean}
     */
    hasImageAttachment: function(message) {
        var attachments = message.getAttachments();
        for (var i = 0; i < attachments.length; i++) {
            if (attachments[i].getContentType().match(/image/)) {
                return true;
            }
        }

        return false;
    }
};

var StringHelper = {
    /**
     * Checks whether the given string contains a goomoji.
     *
     * What's a goomoji? http://stackoverflow.com/questions/28095387/animated-icon-in-email-subject
     *
     * Goomojis in the subject field are perfect indicators of a message being spam.
     * Hopefully they will keep using it.
     *
     * @param {String} string
     *
     * @return {Boolean}
     */
    containsGoomoji: function(string) {
        var emojiRegex = /\p{Emoji}+/gu;
        if (typeof string === 'undefined') {
          return false;
        }
        return string.match(emojiRegex);
    }
};

/** Rules namespace */
var Rules = (function(){
  var rules = {};
  /**
    * @param {GmailMessage} m
    * @param {Object} raw
    *
    * @return {Boolean}
    */
  rules.goomoji = function(m, raw) {
      "Goomoji subject"
      return StringHelper.containsGoomoji(raw.headers.subject) || StringHelper.containsGoomoji(raw.headers.from);
  }

  rules.idInSubject = function(m, raw) {
      "ID in subject"
      var email = Session.getActiveUser().getEmail();
      var userID = email.substr(0, email.indexOf('@'));
      return raw.headers.subject.match(userID);
  }

  rules.ruImage = function(m, raw) {
      "From *.ru + image attachment"
      var ruSender = m.getFrom().match(/\.ru>?$/);
      var withImageAttachment = MessageHelper.hasImageAttachment(m);

      return ruSender && withImageAttachment;
  }

  rules.profanity = function(m, raw) {
      "Profanity filter"
      var matchers = [/slut/i, /f.ck/i, /s.ck/i, /c.ck/i, /lady/i, /h..kup/i, /cum/i, /babe/i, /p.rn/i, /s[e3\*\.]xy?/i, /house\s?wife/i, /pen.s/i];

      for (var i = 0; i < matchers.length; i++) {
          if (raw.headers.subject.match(matchers[i]) || raw.headers.from.match(matchers[i])) {
              return true;
          }
      }

      return false;
  }

  rules.dropbox = function(m, raw) {
      "Has link to dropbox in body"
      return raw.body.match(/dl\.dropboxusercontent\.com/i)
  }

  rules.shortURL = function(m, raw) {
      "Shortened url in body"
      var matchers = [/bit\.ly/i, /tinyurl\.com/i, /goo\.gl/];

      for (var i = 0; i < matchers.length; i++) {
          if (raw.body.match(matchers[i])) {
              return true;
          }
      }

      return false;
  }

  rules.partyURL = function(m, raw) {
      "*.club, *.date, *.top, etc."
      return m.getFrom().match(/(\.club|\.date|\.top|\.xyz|\.trade|\.party)>?$/i) ||
            raw.body.match(/(https?|www).+(\.club|\.date|\.top|\.xyz|\.trade|\.party)/i);
  }

  rules.phpConfidential = function(m, raw) {
      "URL to a .php site & 'confidential' / 'broken' words in body"
      return raw.body.match(/(https?|www).+\.php/i) && raw.body.match(/(confidential|broken)/i);
  }

  return rules;
})();
