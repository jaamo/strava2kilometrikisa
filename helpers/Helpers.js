module.exports = {



    /**
     * Check existense of login cookies from session.
     *
     * @param  {[type]} req Reqeust.
     * @return {[type]}     Return true if logged in.
     */
    isLoggedIn: function(req) {

        if (req.session.stravaToken
            && req.session.kilometrikisaToken
            && req.session.kilometrikisaSessionId) {
            return true;
        } else {
            return false;
        }

    }



}
