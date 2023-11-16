{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
	buildInputs = with pkgs; [
		nodejs
		caddy
	];

	shellHook = ''
		PATH="$PWD/node_modules/.bin:$PATH"
		npm i
	'';
}
