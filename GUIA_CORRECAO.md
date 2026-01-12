# GUIA DE CORREÇÃO DE ERROS (URGENTE)

## 1. ERRO DESKTOP: "Failed to save skill header"
**Motivo:** O banco de dados (Supabase) bloqueou você porque você não está logado.
**Solução:** Precisamos liberar o acesso "Anônimo" temporariamente.

**Passo a Passo:**
1.  Acesse seu painel do **Supabase**.
2.  No menu esquerdo, clique em **SQL Editor** (ícone `C_>` ou terminal).
3.  Clique em **+ New Query**.
4.  Cole o código abaixo EXATAMENTE como está:

```sql
-- Liberar INSERT na tabela SKILLS para anônimos
CREATE POLICY "Enable insert for anon skills" 
ON public.skills 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Liberar INSERT na tabela SKILL_FRAMES para anônimos
CREATE POLICY "Enable insert for anon frames" 
ON public.skill_frames 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Liberar SELECT (Leitura) para o Player funcionar
CREATE POLICY "Enable select for anon skills" ON public.skills FOR SELECT TO anon USING (true);
CREATE POLICY "Enable select for anon frames" ON public.skill_frames FOR SELECT TO anon USING (true);
```
5.  Clique em **RUN** (Botão verde).
6.  *Pronto. Tente salvar novamente no Desktop.*

---

## 2. ERRO MOBILE: "Cannot read properties of undefined..."
**Motivo:** O Google Chrome do celular **proíbe** câmera em sites que não têm cadeado (HTTPS), a menos que seja `localhost`. Como você usa o IP (`192.168...`), ele bloqueia.

**Solução (Passo a Passo Rápido):**
1.  No Chrome do seu celular, digite na barra de endereço:
    `chrome://flags`
2.  Vai abrir uma tela de configurações ocultas. Na busca, digite:
    `unsafely`
3.  Vai aparecer uma opção: **"Insecure origins treated as secure"**.
4.  Mude de `Disabled` para **`Enabled`**.
5.  No campo de texto que aparece embaixo dela, digite o endereço do seu PC com a porta:
    `http://192.168.1.228:3000`
    *(Confira se o IP ainda é esse mesmo)*
6.  Clique no botão **Relaunch** (Reiniciar) que aparece no fundo da tela.

**Agora o Chrome acha que seu site é seguro e vai liberar a câmera.**
