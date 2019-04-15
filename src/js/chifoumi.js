'use strict';

var joueur1 = "";
var joueur2 = "";
var nb;
var gagné = 0, perdu = 0;

function compute()
{
	nb = Math.floor(Math.random()*3) + 1;
	if (nb == 1)
		joueur2 = "Pierre";
	else if (nb == 2)
		joueur2 = "Feuille";
	else if (nb == 3)
		joueur2 = "Ciseau";
}
//=================================== Get joueur1 input. ======================================
function res(form,val)
{
	if (joueur1 != "")
		return;
	form.texte.value = val;
	joueur1 = val;
}
//================================= Test for validity. =====================================
function testing(form)
{
	if (joueur1 == "" || joueur2 == "")
		return;
		console.log(joueur2);
	if (joueur1 == joueur2)
	{
		alert("egalité , l'ordi a choisi "+ joueur2+" !");
		// gagné += 1;
		calcScore(form);
	}
	else
	if(joueur1 === 'pierre' && joueur2 === 'feuille' ||joueur1 === 'Ciseau' && joueur2 === 'pierre' ||joueur1 === 'feuille' && joueur2 === 'Ciseau'  ) {
		alert("Perdu !\nL'ordinateur avait choisi " + joueur2 + ".");
		perdu += 1;
		calcScore(form);
		}
	else
	if(joueur1 === 'feuille' && joueur2 === 'pierre' ||joueur1=== 'pierre' && joueur2 === 'Ciseau' ||joueur1 === 'Ciseau' && joueur2 === 'feuille'  ) {
		alert("Gagné !\nL'ordinateur avait choisi " + joueur2 + ".");
		gagné += 1;
		calcScore(form);
		}
}
//=================================== Sum up score. ========================================
function calcScore(form)
{
	document.getElementById("score").innerHTML = "Gagné: " + gagné + " fois. Perdu: " + perdu + " fois."
}
//====================================== Reset. ============================================
function raz(form)
{
	form.texte.value = "";
	joueur1 = "";
	joueur2 = "";
}