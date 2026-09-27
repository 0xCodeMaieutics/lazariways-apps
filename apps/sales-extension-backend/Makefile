
request-code:
	@curl -X POST "http://localhost:3000/login/request-code"

login-verification:
	@curl -X POST "http://localhost:3000/login/verfication" -H "Content-Type: application/json" -d '{"code": "367731"}'

abstract-info:
	@curl -X POST "http://localhost:3000/abstract-info" -H "Content-Type: application/json" -H "Authorization: Bearer 30d0168b7c15eb32f0a8278829678dfd55876e17d52cb1d74fb73ef7fdb72181" -d '{"input": "<div class=\"col-xs-10\"> <h3>Hotel Anna</h3> <p>Via Gardesana, 398 <br> Loc. Campagnola - <br>37018 Malcesine (Verona) <br> p.iva 02173420239 </p></div>"}'