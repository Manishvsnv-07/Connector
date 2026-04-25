import jwt from "jsonwebtoken"

function islogged(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/")
    }
    else {
        let verify = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        req.datahere = verify;
        next()
    }
}

export default islogged;