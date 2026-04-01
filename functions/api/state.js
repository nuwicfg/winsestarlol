export async function onRequestGet(context) {
    try {
        const stateStr = await context.env.SVRGN_DB.get('globalState');
        if (!stateStr) {
            return new Response(JSON.stringify({}), { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        return new Response(stateStr, { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        
        // Panel yetkilendirmesi için şifre kontrolü
        if (body.adminPassword !== 'winserules123') {
            return new Response(JSON.stringify({ error: 'Unauthorized: Yanlış admin şifresi' }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Şifreyi veritabanına kaydetmemek için siliyoruz
        delete body.adminPassword;
        
        // Cloudflare KV veritabanına JSON verisini yazıyoruz
        await context.env.SVRGN_DB.put('globalState', JSON.stringify(body));
        
        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
