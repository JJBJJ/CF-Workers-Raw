export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname !== '/') {
            // Gitee API URL construction
            const giteeRawUrl = `https://gitee.com/api/v5/repos${url.pathname}?ref=master`;
            let token = url.searchParams.get('access_token') || env.GH_TOKEN;

            if (!token) {
                return new Response('TOKEN不能为空', { status: 400 });
            }

            // Setting up headers
            const headers = new Headers({ 'Authorization': `token ${token}` });

            // Making the request
            const response = await fetch(giteeRawUrl, { headers });

            // Handling the response
            if (response.ok) {
                return new Response(response.body, {
                    status: response.status,
                    headers: response.headers,
                });
            } else {
                return new Response(env.ERROR || '无法获取文件,检查路径或TOKEN是否正确.', { status: response.status });
            }
        } else {
            // Handling the root path
            const envKey = env.URL302 || env.URL;
            if (envKey) {
                const URLs = await parseUrls(env[envKey]);
                const URL = URLs[Math.floor(Math.random() * URLs.length)];
                return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
            }
            // Serving a default nginx page for the root path
            return new Response(await nginxPage(), {
                headers: {
                    'Content-Type': 'text/html; charset=UTF-8',
                },
            });
        }
    }
};

async function parseUrls(envadd) {
    return envadd.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',').trim().split(',');
}

async function nginxPage() {
    return `
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
body {
	width: 35em;
	margin: 0 auto;
	font-family: Tahoma, Verdana, Arial, sans-serif;
}
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
<p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>
`;
}
