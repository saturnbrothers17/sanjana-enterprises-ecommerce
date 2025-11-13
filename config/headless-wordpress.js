const mysql = require('mysql2/promise');
require('dotenv').config();

class HeadlessWordPressService {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.WP_DB_HOST,
      user: process.env.WP_DB_USER,
      password: process.env.WP_DB_PASSWORD,
      database: process.env.WP_DB_NAME,
      port: process.env.WP_DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  // RESTful API endpoints for headless CMS
  async getAllContent(type = 'post', limit = 10, offset = 0) {
    try {
      const [rows] = await this.pool.execute(`
        SELECT 
          p.ID as id,
          p.post_title as title,
          p.post_content as content,
          p.post_excerpt as excerpt,
          p.post_status as status,
          p.post_date as published_date,
          p.post_modified as modified_date,
          p.post_name as slug,
          p.post_type as type
        FROM wp_posts p
        WHERE p.post_type = ? 
          AND p.post_status = 'publish'
        ORDER BY p.post_date DESC
        LIMIT ? OFFSET ?
      `, [type, limit, offset]);

      return rows.map(post => ({
        ...post,
        content: this.cleanContent(post.content),
        excerpt: this.cleanContent(post.excerpt),
        permalink: `/api/content/${type}/${post.slug}`,
        api_url: `/api/content/${post.id}`
      }));
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  async getContentBySlug(slug, type = 'post') {
    try {
      const [rows] = await this.pool.execute(`
        SELECT 
          p.ID as id,
          p.post_title as title,
          p.post_content as content,
          p.post_excerpt as excerpt,
          p.post_status as status,
          p.post_date as published_date,
          p.post_modified as modified_date,
          p.post_name as slug,
          p.post_type as type,
          p.post_author as author_id
        FROM wp_posts p
        WHERE p.post_name = ? 
          AND p.post_type = ?
          AND p.post_status = 'publish'
      `, [slug, type]);

      if (rows.length === 0) return null;

      const content = rows[0];
      const [author] = await this.pool.execute(`
        SELECT display_name as name, user_email as email FROM wp_users WHERE ID = ?
      `, [content.author_id]);

      const [categories] = await this.pool.execute(`
        SELECT t.name, t.slug FROM wp_terms t
        INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        INNER JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = ? AND tt.taxonomy IN ('category', 'product_cat')
      `, [content.id]);

      const [tags] = await this.pool.execute(`
        SELECT t.name, t.slug FROM wp_terms t
        INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        INNER JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        WHERE tr.object_id = ? AND tt.taxonomy IN ('post_tag', 'product_tag')
      `, [content.id]);

      const [images] = await this.pool.execute(`
        SELECT guid as url, post_title as alt FROM wp_posts 
        WHERE post_parent = ? AND post_type = 'attachment' AND post_mime_type LIKE 'image%'
        ORDER BY menu_order ASC
      `, [content.id]);

      return {
        ...content,
        content: this.cleanContent(content.content),
        excerpt: this.cleanContent(content.excerpt),
        author: author[0] || null,
        categories: categories,
        tags: tags,
        images: images,
        meta: await this.getContentMeta(content.id)
      };
    } catch (error) {
      console.error('Error fetching content by slug:', error);
      throw error;
    }
  }

  async getContentMeta(contentId) {
    try {
      const [rows] = await this.pool.execute(`
        SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?
      `, [contentId]);

      const meta = {};
      rows.forEach(row => {
        meta[row.meta_key] = row.meta_value;
      });

      return meta;
    } catch (error) {
      console.error('Error fetching content meta:', error);
      return {};
    }
  }

  async getContentByType(type, options = {}) {
    const {
      limit = 10,
      offset = 0,
      category = null,
      tag = null,
      search = null,
      orderBy = 'date',
      order = 'DESC'
    } = options;

    let query = `
      SELECT 
        p.ID as id,
        p.post_title as title,
        p.post_content as content,
        p.post_excerpt as excerpt,
        p.post_status as status,
        p.post_date as published_date,
        p.post_modified as modified_date,
        p.post_name as slug,
        p.post_type as type
      FROM wp_posts p
    `;

    const params = [];
    const conditions = ['p.post_type = ?', 'p.post_status = "publish"'];
    params.push(type);

    if (category) {
      query += `
        INNER JOIN wp_term_relationships tr ON p.ID = tr.object_id
        INNER JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        INNER JOIN wp_terms t ON tt.term_id = t.term_id
      `;
      conditions.push('t.slug = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(p.post_title LIKE ? OR p.post_content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` WHERE ${conditions.join(' AND ')}`;

    const orderMap = {
      'date': 'p.post_date',
      'title': 'p.post_title',
      'modified': 'p.post_modified',
      'id': 'p.ID'
    };

    query += ` ORDER BY ${orderMap[orderBy] || 'p.post_date'} ${order === 'ASC' ? 'ASC' : 'DESC'}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [rows] = await this.pool.execute(query, params);
      return rows.map(post => ({
        ...post,
        content: this.cleanContent(post.content),
        excerpt: this.cleanContent(post.excerpt)
      }));
    } catch (error) {
      console.error('Error fetching content by type:', error);
      throw error;
    }
  }

  async getCategories(type = 'category') {
    try {
      const [rows] = await this.pool.execute(`
        SELECT t.term_id as id, t.name, t.slug, tt.description, tt.count
        FROM wp_terms t
        INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy = ?
        ORDER BY t.name ASC
      `, [type]);

      return rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getMenus() {
    try {
      const [rows] = await this.pool.execute(`
        SELECT t.term_id as id, t.name as menu_name, t.slug as menu_slug
        FROM wp_terms t
        INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'nav_menu'
      `);

      const menus = {};
      for (const menu of rows) {
        const [items] = await this.pool.execute(`
          SELECT 
            p.ID as id,
            p.post_title as title,
            p.post_name as slug,
            p.post_type as type,
            m.meta_value as menu_item_parent,
            pm.meta_value as menu_order
          FROM wp_posts p
          INNER JOIN wp_term_relationships tr ON p.ID = tr.object_id
          LEFT JOIN wp_postmeta m ON p.ID = m.post_id AND m.meta_key = '_menu_item_menu_item_parent'
          LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_menu_item_menu_order'
          WHERE tr.term_taxonomy_id = ?
          ORDER BY CAST(pm.meta_value AS UNSIGNED) ASC
        `, [menu.id]);

        menus[menu.menu_slug] = items;
      }

      return menus;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    }
  }

  async getSiteInfo() {
    try {
      const [options] = await this.pool.execute(`
        SELECT option_name, option_value FROM wp_options 
        WHERE option_name IN ('blogname', 'blogdescription', 'siteurl', 'home')
      `);

      const siteInfo = {};
      options.forEach(option => {
        siteInfo[option.option_name] = option.option_value;
      });

      return {
        name: siteInfo.blogname,
        description: siteInfo.blogdescription,
        url: siteInfo.siteurl,
        home: siteInfo.home
      };
    } catch (error) {
      console.error('Error fetching site info:', error);
      return {};
    }
  }

  cleanContent(content) {
    if (!content) return '';
    return content
      .replace(/\[\/?[^\]]+\]/g, '') // Remove shortcodes
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .trim();
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new HeadlessWordPressService();
